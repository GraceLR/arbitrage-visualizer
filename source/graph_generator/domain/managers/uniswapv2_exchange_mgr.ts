import { get_abi, get_built_abi } from '../../utils/load_abis';
import CryptoNode from '../crypto';
import UniswapV2ExchangePair from '../exchange_pair/uniswapv2_exchange_pair';
import { isNil, toLower } from 'ramda';
import ExchangePair from '../exchange_pair/exchange_pair';
import { BigNumber, FixedNumber } from 'ethers';
import { Contract } from '../../multicall';
import { run, runAll, runOne } from '../../arb/providers';
import { lessThan, max } from '../../utils/fixedNumberExtensions';
import ExchangeManager from './exchange_mgr';
import {
    HARMONY_MIN_BLOCK,
    MIN_LIQUIDITY_IN_USD,
} from '../../config/constants';
import { Config, ConfigKeys } from '../../config/config';
import e from 'express';

interface Graph {
    exchange_pairs: {
        exchange: string;
        crypto0: string;
        crypto1: string;
        crypto0_name: string;
        crypto1_name: string;
        pair_address: string;
        router_address: string;
        exchange_fee: string;
    }[];
    cryptos: {
        name: string;
        address: string;
        precision: number;
    }[];
}

export default class UniswapV2ExchangeManager extends ExchangeManager {
    chain_name: string;

    constructor(chain_name: string) {
        super();
        this.chain_name = chain_name;
    }

    exchanges = (): [string, string, string, string][] => {
        throw new Error('Not implemented');
    };

    stable_coins = (): { [name: string]: boolean } => {
        throw new Error('Not implemented');
    };

    build_pair = (
        exchange_name: string,
        crypto0: CryptoNode,
        crypto1: CryptoNode,
        pair_contract: Contract,
        router_address: string,
        exchange_fee: string
    ) =>
        new UniswapV2ExchangePair(
            exchange_name,
            crypto0,
            crypto1,
            pair_contract,
            router_address,
            exchange_fee
        );

    static async prune_graph(
        exchange_pairs: UniswapV2ExchangePair[],
        crypto_dict: { [name: string]: CryptoNode }
    ): Promise<[UniswapV2ExchangePair[], { [name: string]: CryptoNode }]> {
        const exchange_pairs_map = new Set(exchange_pairs);
        const crypto_map = new Map(Object.entries(crypto_dict));

        // log_message(
        //     `Beginning graph prune. Before prune there are ${exchange_pairs_map.size} pairs and ${crypto_map.size} tokens`
        // );

        while (true) {
            const pair_length_before = exchange_pairs_map.size;
            const crypto_length_before = crypto_map.size;

            // this is wasteful, if this function is too slow this is the first place to look
            await UniswapV2ExchangeManager.refresh_liquidity(
                Array.from(exchange_pairs_map.keys())
            );

            for (const exchange_pair of exchange_pairs_map.keys()) {
                const reserve_in_usd = exchange_pair.reserves_in_usd;
                if (
                    isNil(reserve_in_usd) ||
                    lessThan(reserve_in_usd, MIN_LIQUIDITY_IN_USD) ||
                    exchange_pair.last_transaction < HARMONY_MIN_BLOCK
                ) {
                    exchange_pair.crypto0.remove_exchange_pair(exchange_pair);
                    exchange_pair.crypto1.remove_exchange_pair(exchange_pair);
                    exchange_pairs_map.delete(exchange_pair);
                }
            }

            let found_edge = true;
            while (found_edge) {
                found_edge = false;
                for (const [addr, crypto] of crypto_map.entries()) {
                    if (crypto.exchange_pairs.length == 0) {
                        crypto_map.delete(addr);
                    }
                    if (crypto.exchange_pairs.length == 1) {
                        crypto.exchange_pairs[0]
                            .get_other_crypto(crypto)
                            .remove_exchange_pair(crypto.exchange_pairs[0]);
                        crypto_map.delete(addr);
                        exchange_pairs_map.delete(
                            crypto.exchange_pairs[0] as UniswapV2ExchangePair
                        );
                        found_edge = true;
                    }
                }
            }

            if (
                pair_length_before == exchange_pairs_map.size &&
                crypto_length_before == crypto_map.size
            ) {
                // log_message(
                //     `Graph prune complete. ${pair_length_before} pairs and ${crypto_length_before} tokens remain.`
                // );
                break;
            }
        }

        return [
            [...exchange_pairs_map.keys()],
            Object.assign(
                {},
                ...Array.from(crypto_map.entries()).map(([k, v]) => ({
                    [k]: v,
                }))
            ),
        ];
    }

    static async refresh_liquidity(exchange_pairs: UniswapV2ExchangePair[]) {
        const { results, blockNumber } = (await run(
            exchange_pairs.map((c) => c.fetchReserves())
        )) as {
            results: [BigNumber, BigNumber, number][];
            blockNumber: number;
        };
        const set_usd_list: Set<UniswapV2ExchangePair> = new Set();

        for (let i = 0; i < results.length; i++) {
            const exchange_pair = exchange_pairs[i];
            const reserve = results[i];
            exchange_pair.set_amounts(reserve);

            if (!exchange_pair.has_stablecoin()) {
                exchange_pair.set_reserves_in_usd(FixedNumber.from(-1));
                set_usd_list.add(exchange_pair);
            }
        }

        const specialFraction = [];
        const fractionCalls = [];

        for (let i = 0; i < exchange_pairs.length; i++) {
            const pair = exchange_pairs[i];
            const fractionCall = pair.fetchFractions();

            if (fractionCall) {
                specialFraction.push(pair);
                fractionCalls.push(fractionCall);
            } else {
                pair.set_fractions(pair.calc_fraction(null));
            }
        }

        const fractions = await run(fractionCalls);

        for (let i = 0; i < fractions.results.length; i++) {
            const pair = specialFraction[i];
            const fraction = fractions.results[i];
            pair.set_fractions(pair.calc_fraction(fraction));
        }

        let progress_made = true;
        while (progress_made) {
            progress_made = false;
            const working_set = new Set(set_usd_list);
            for (const exchange_pair of working_set.keys()) {
                const amounts: FixedNumber[] = [];
                const c0 = exchange_pair.crypto0;
                const c1 = exchange_pair.crypto1;

                const find_amounts = (
                    far_pairs: ExchangePair[],
                    crypto: CryptoNode
                ) => {
                    for (const far_pair of far_pairs) {
                        if (
                            far_pair instanceof UniswapV2ExchangePair &&
                            !working_set.has(far_pair)
                        ) {
                            const r1: FixedNumber =
                                exchange_pair.get_reserves(crypto);
                            const r2: FixedNumber =
                                far_pair.get_reserves(crypto);
                            const amount = r2.isZero()
                                ? FixedNumber.from(0)
                                : r1
                                      .divUnsafe(r2)
                                      .mulUnsafe(far_pair.reserves_in_usd);
                            amounts.push(amount);
                        }
                    }
                };

                find_amounts(c0.exchange_pairs, c0);
                find_amounts(c1.exchange_pairs, c1);

                if (amounts.length > 0) {
                    exchange_pair.set_reserves_in_usd(max(amounts));
                    set_usd_list.delete(exchange_pair);
                    progress_made = true;
                }
            }
        }

        return blockNumber;
    }

    get_contracts_concurrent = (
        contract_addresses: string[],
        abi: string[]
    ) => {
        return contract_addresses.map((a) => new Contract(a, abi));
    };

    generate_exchange_pairs_and_cryptos = async (
        exchange_name: string,
        router_address: string,
        factory_address: string,
        crypto_dict: { [name: string]: CryptoNode },
        exchange_fee: string
    ) => {
        const factory_abi = await get_built_abi('IUniswapV2Factory');
        const pair_abi = await get_built_abi('IUniswapV2Pair');
        const token_abi = await get_abi('harmony_hrc20');
        const router_abi = await get_built_abi('IUniswapV2Router01');

        if (factory_address == '') {
            // try to grab it from the router
            const router = new Contract(router_address, router_abi);
            factory_address = await runOne(router.factory());
        }

        const factory = new Contract(factory_address, factory_abi);
        const pair_length = await runOne(factory.allPairsLength());
        let call_list = [];

        // log_message(
        //     `${pair_length} pairs found for ${exchange_name}. Beginning contract generation.`
        // );

        for (let i = 0; i < pair_length; i++) {
            call_list.push(factory.allPairs(i));
        }

        call_list = await runAll(call_list);

        const pair_contracts = this.get_contracts_concurrent(
            call_list,
            pair_abi
        );

        // log_message(`Generating tokens for ${exchange_name}`);

        const token0s = (
            await runAll(pair_contracts.map((c) => c.token0()))
        ).map((token) => toLower(token));
        const token1s = (
            await runAll(pair_contracts.map((c) => c.token1()))
        ).map((token) => toLower(token));

        const missing: string[] = [];
        const seen = Object.assign(
            {},
            ...Object.keys(crypto_dict).map((c) => ({ [c]: true }))
        );

        for (const addr of [...token0s, ...token1s]) {
            if (!seen[addr]) {
                missing.push(addr);
                seen[addr] = true;
            }
        }

        const contracts = this.get_contracts_concurrent(missing, token_abi);

        const names: string[] = await runAll(contracts.map((c) => c.symbol()));
        const precisions: number[] = await runAll(
            contracts.map((c) => c.decimals())
        );

        const stable_coins = this.stable_coins();

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const contract = contracts[i];
            const precision = precisions[i];

            if (!isNil(name) && !isNil(precision)) {
                crypto_dict[toLower(contract.address)] = new CryptoNode(
                    name,
                    contract,
                    precision,
                    stable_coins[toLower(name)]
                );
            }
        }

        // log_message(
        //     `Token generation complete for ${exchange_name}, ${names.length} tokens generated`
        // );
        // log_message('');

        const exchange_pairs: UniswapV2ExchangePair[] = [];

        for (let i = 0; i < token0s.length; i++) {
            const contract = pair_contracts[i];
            const token0 = token0s[i];
            const token1 = token1s[i];

            const t0 = crypto_dict[token0];
            const t1 = crypto_dict[token1];
            if (!isNil(t0) && !isNil(t1)) {
                exchange_pairs.push(
                    this.build_pair(
                        exchange_name,
                        t0,
                        t1,
                        contract,
                        router_address,
                        exchange_fee
                    )
                );
            }
        }

        return exchange_pairs;
    };

    generate_cryptos_and_exchange_pairs = async (crypto_dict: {
        [name: string]: CryptoNode;
    }): Promise<[{ [name: string]: CryptoNode }, ExchangePair[]]> => {
        let exchange_pairs: UniswapV2ExchangePair[] = [];

        for (const [
            exchange_name,
            router_address,
            factory_address,
            exchange_fee,
        ] of this.exchanges()) {
            exchange_pairs = exchange_pairs.concat(
                await this.generate_exchange_pairs_and_cryptos(
                    exchange_name,
                    router_address,
                    factory_address,
                    crypto_dict,
                    exchange_fee
                )
            );
        }

        const [pruned_exchange_pairs, pruned_crypto_dict] =
            await UniswapV2ExchangeManager.prune_graph(
                exchange_pairs,
                crypto_dict
            );

        exchange_pairs = pruned_exchange_pairs;
        crypto_dict = pruned_crypto_dict;

        return [crypto_dict, exchange_pairs];
    };
}

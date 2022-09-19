import { Contract } from '../../multicall';
import CryptoNode from '../../domain/crypto';
import CurveExchangePair from '../../domain/exchange_pair/curve_exchange_pair';
import { get_abi } from '../../utils/load_abis';
import { runOne } from '../../arb/providers';
import ExchangeManager from '../../domain/managers/exchange_mgr';
import ExchangePair from '../../domain/exchange_pair/exchange_pair';

export default class HarmonyCurveExchangeManager extends ExchangeManager {
    underlying_coins: { [name: number]: string } = {};
    all_cryptos: { [name: string]: CryptoNode };

    constructor(all_cryptos: { [name: string]: CryptoNode }) {
        super();
        this.all_cryptos = all_cryptos;
    }

    __get_underlying_index__ = (coin: CryptoNode): number => {
        for (let i = 0; i < 5; i++) {
            if (
                this.underlying_coins[i].toLowerCase() ==
                coin.contract.address.toLowerCase()
            ) {
                return i;
            }
        }
        throw new Error(
            `Could not find underlying index for coin ${coin.name}`
        );
    };

    generate_cryptos_and_exchange_pairs = async (crypto_dict: {
        [name: string]: CryptoNode;
    }): Promise<[{ [name: string]: CryptoNode }, ExchangePair[]]> => {
        // TODO: need? ("Curve metapool" )
        // before; ethers.ContractFactory.fromSolidity(this.tricrypto_metapool_abi).attach("0x76147c0C989670D106b57763a24410A2a22e335E")
        const curve_metapool_contract = new Contract(
            '0x76147c0C989670D106b57763a24410A2a22e335E',
            await get_abi('harmony/curve/tricrypto_zap')
        );

        // We keep this more abstract by manually fetching the underlying indices for the coins.
        for (let i = 0; i < 5; i++) {
            try {
                this.underlying_coins[i] = await runOne(
                    curve_metapool_contract.underlying_coins(i)
                );
            } catch {
                break;
            }
        }

        // We now need to fetch all combos of edges between the nodes, with their matching underlying indices.
        let results: CurveExchangePair[] = [];
        const coins = Object.values(this.all_cryptos);
        for (let i = 0; i < coins.length - 1; i++) {
            for (let j = i + 1; j < coins.length; j++) {
                results.push(
                    new CurveExchangePair(
                        curve_metapool_contract,
                        coins[i],
                        this.__get_underlying_index__(coins[i]),
                        coins[j],
                        this.__get_underlying_index__(coins[j])
                    )
                );
            }
        }
        return [this.all_cryptos, results];
    };
}

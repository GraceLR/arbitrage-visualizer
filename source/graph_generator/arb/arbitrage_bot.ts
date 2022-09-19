import { FixedNumber } from 'ethers';
import ExchangePair from '../domain/exchange_pair/exchange_pair';
import CryptoNode from '../domain/crypto';
import ArbitrageCycleResolver from './arbitrage_cycle_resolver';
// import { LEVELS, log_message } from '../utils/print';
import Heartbeat2 from './heartbeat2';

export async function run(
    all_cryptos: { [name: string]: CryptoNode },
    all_exchange_pairs: ExchangePair[],
    block_speed_in_seconds: FixedNumber
) {
    const hmy_heartbeat = new Heartbeat2(
        all_exchange_pairs,
        all_cryptos,
        block_speed_in_seconds
    );

    hmy_heartbeat.beat();

    let last_block_number = 0;

    while (true) {
        const data = await hmy_heartbeat.get_next_data(last_block_number);
        last_block_number = data.block_number;
        all_exchange_pairs = data.pairs;
        all_cryptos = data.all_cryptos;

        const arb_cycle_resolver = new ArbitrageCycleResolver(
            Object.values(all_cryptos),
            all_exchange_pairs
        );

        // Resolve all cycles, even if we don't have the starting token.
        arb_cycle_resolver.resolve_cycles();

        // Start by getting all results, for debugging & filtering evaluation purposes
        const results = arb_cycle_resolver.get_cost_sorted_solutions();

        console.log(results)
    }
}

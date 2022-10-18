import { FixedNumber } from "ethers";
import ExchangePair from "../domain/exchange_pair/exchange_pair";
import CryptoNode from "../domain/crypto";
import ArbitrageCycleResolver from "./arbitrage_cycle_resolver";
import { LEVELS, log_message } from "../utils/print";
import Heartbeat2 from "./heartbeat2";

export async function run(
  all_cryptos: { [name: string]: CryptoNode },
  all_exchange_pairs: ExchangePair[],
  block_speed_in_seconds: FixedNumber,
  clients
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

    const arb_cycle_resolver = new ArbitrageCycleResolver( // finding cycles in the map
      Object.values(all_cryptos),
      all_exchange_pairs
    );

    // Resolve all cycles, even if we don't have the starting token.
    arb_cycle_resolver.resolve_cycles();

    // Start by getting all results, for debugging & filtering evaluation purposes
    const results = arb_cycle_resolver.get_cost_sorted_solutions();

    const cryptos: any[] = [];
    const edges: any[] = [];

    for (const key in all_cryptos) {
      const crypto = all_cryptos[key];
      const address = crypto.get_contract_address();
      cryptos.push({
        id: address,
        crypto: crypto.name,
        contract_address: address,
        precision: crypto.precision,
        is_stable: crypto.is_stable,
        usd_price: crypto.get_approx_one_usd_in_units().toUnsafeFloat(),
        wallet_amount: 0,
      });
    }

    for (const key in all_exchange_pairs) {
      const edge = all_exchange_pairs[key];
      edges.push({
        crypto_id_0: edge.crypto0.get_contract_address(),
        crypto_id_1: edge.crypto1.get_contract_address(),
        exchange_name: edge.exchange_name,
        price_tangent: edge.fraction.toUnsafeFloat(),
        inverse_price_tangent: edge.reverse_fraction.toUnsafeFloat(),
        is_dynamic: true,
        exchange_type: edge.constructor.name,
        position: null,
      });
    }

    const graph = JSON.stringify({
      exchangepair: edges,
      crypto: cryptos,
    });

    for (const key in clients) {
      clients[key].send(graph);
    }
  }
}

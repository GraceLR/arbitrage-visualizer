import { FixedNumber } from "ethers";
import { toLower } from "ramda";
import CryptoNode from "../domain/crypto";
import ExchangePair from "../domain/exchange_pair/exchange_pair";
import UniswapV2ExchangePair from "../domain/exchange_pair/uniswapv2_exchange_pair";
import UniswapV2ExchangeManager from "../domain/managers/uniswapv2_exchange_mgr";
// import SolidlyPair from '../exchanges/fantom/solidly_pair';
import { LEVELS, log_message } from "../utils/print";
import { sleep } from "../utils/sleep";
import { run } from "./providers";

export default class Heartbeat2 {
  heartbeat_interval: number;
  other_pairs: ExchangePair[] = [];
  uniswap_pairs: UniswapV2ExchangePair[] = [];
  all_cryptos: { [name: string]: CryptoNode };
  current_block: number = 0;
  arb_happening = false;

  constructor(
    all_exchange_pairs: ExchangePair[],
    all_cryptos: { [name: string]: CryptoNode },
    block_speed_in_ms: FixedNumber
  ) {
    this.heartbeat_interval = block_speed_in_ms.toUnsafeFloat() / 10;
    this.all_cryptos = all_cryptos;

    // Build a big, single call list with integer receipts for pairs to retreive data
    for (const pair of all_exchange_pairs) {
      if (pair instanceof UniswapV2ExchangePair) {
        this.uniswap_pairs.push(pair as UniswapV2ExchangePair);
      } else {
        this.other_pairs.push(pair);
      }
    }
  }

  get_next_data = async (last_block: number) => {
    const before = Date.now();
    while (last_block === this.current_block) {
      await sleep(this.heartbeat_interval / 10);
    }

    // while (this.arb_happening) {
    //   await sleep(this.heartbeat_interval);
    // }

    log_message(`waiting - ${Date.now() - before}`, LEVELS.DEBUG);

    if (last_block + 1 !== this.current_block) {
      log_message(
        `missed block: ${last_block} -> ${this.current_block}`,
        LEVELS.DEBUG
      );
    }

    return {
      block_number: this.current_block,
      pairs: [...this.other_pairs, ...this.uniswap_pairs],
      all_cryptos: this.all_cryptos,
    };
  };

  beat = async () => {
    while (true) {
      await this.__execute_beat__();
      await sleep(this.heartbeat_interval);
    }
  };

  copy_stuff = () => {
    const crypto_dict: { [name: string]: CryptoNode } = {};
    for (const crypto of Object.values(this.all_cryptos)) {
      crypto_dict[toLower(crypto.contract.address)] = new CryptoNode(
        crypto.name,
        crypto.contract,
        crypto.precision,
        crypto.is_stable
      );
    }

    const other_pairs: ExchangePair[] = [];
    const uniswap_pairs: UniswapV2ExchangePair[] = [];

    for (const exchange_pair of this.uniswap_pairs) {
      const c0 = crypto_dict[toLower(exchange_pair.crypto0.contract.address)];
      const c1 = crypto_dict[toLower(exchange_pair.crypto1.contract.address)];

      uniswap_pairs.push(
        new UniswapV2ExchangePair(
          exchange_pair.exchange_name,
          c0,
          c1,
          exchange_pair.pair_contract,
          exchange_pair.router_address,
          exchange_pair.exchange_fee
        )
      );
    }

    // for (const exchange_pair of this.other_pairs) {
    //     const c0 = crypto_dict[R.toLower(exchange_pair.crypto0.contract.address)];
    //     const c1 = crypto_dict[R.toLower(exchange_pair.crypto1.contract.address)];

    //     other_pairs.push(
    //         new UniswapV2ExchangePair(
    //             exchange_pair.exchange_name,
    //             c0,
    //             c1,
    //             exchange_pair.pair_contract,
    //             exchange_pair.router_address,
    //             exchange_pair.exchange_fee
    //         )
    //     );
    // }

    return {
      crypto_dict,
      other_pairs,
      uniswap_pairs,
    };
  };

  // Returns the block number associated with the refreshed data
  __execute_beat__ = async () => {
    try {
      let call_list: any[] = [];

      const { uniswap_pairs, other_pairs, crypto_dict } = this.copy_stuff();

      for (const pair of other_pairs) {
        pair.queue_refresh_call_data(call_list, call_list.length);
      }

      if (other_pairs.length > 0) {
        const { blockNumber, results } = await run(call_list); // getting exchange rates

        // We now pass the results back to the exchange pairs
        for (const pair of other_pairs) {
          pair.accept_refresh_call_data(results);
        }
      }

      const blockNumber = await UniswapV2ExchangeManager.refresh_liquidity(
        // getting exchange rates for uniswap pairs
        uniswap_pairs
      );

      if (blockNumber > this.current_block) {
        log_message(`new block: ${blockNumber}`, LEVELS.DEBUG);

        this.current_block = blockNumber;
        this.all_cryptos = crypto_dict;
        this.other_pairs = other_pairs;
        this.uniswap_pairs = uniswap_pairs;
      }
    } catch (e: any) {
      log_message(`beat failed, ${e.message.substring(0, 300)}`, LEVELS.ERROR);
    }
  };
}

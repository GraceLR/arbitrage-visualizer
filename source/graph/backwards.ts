import { BigNumber, Contract, ethers, FixedNumber } from "ethers";
import { getJsonWalletAddress } from "ethers/lib/utils";
import fs from "fs";
// import path from 'path';
import { run } from "./arb/arbitrage_bot";
import { getProvider, setProvider } from "./arb/providers";
import { Config, ConfigKeys } from "./config/config";
import AssetManager from "./domain/managers/asset_mgr";
// import AuroraAssetManager from './exchanges/aurora/aurora_asset_mgr';
// import CronosAssetManager from './exchanges/cronos/cronos_asset_mgr';
// import FantomAssetManager from './exchanges/fantom/fantom_asset_mgr';
import HarmonyAssetManager from "./exchanges/harmony/hmy_asset_mgr";
// import MoonriverAssetManager from './exchanges/moonriver/moonriver_asset_mgr';
// import OkexAssetManager from './exchanges/okex/okex_asset_mgr';
import { LEVELS, log_message } from "./utils/print";
import { sleep } from "./utils/sleep";
import routerConfig from "./config/router_config.json";
import ArbitrageCycleResolver from "./arb/arbitrage_cycle_resolver";
import Heartbeat2 from "./arb/heartbeat2";
import db_operations from "../db/db_operations";

const managers: {
  [name: string]: () => Promise<AssetManager>;
} = {
  harmony: async () => await HarmonyAssetManager.create(),
  // aurora: async (a: string, s: ethers.Signer) =>
  //     await AuroraAssetManager.create(a, s),
  // cronos: async (a: string, s: ethers.Signer) =>
  //     await CronosAssetManager.create(a, s),
  // moonriver: async (a: string, s: ethers.Signer) =>
  //     await MoonriverAssetManager.create(a, s),
  // fantom: async (a: string, s: ethers.Signer) =>
  //     await FantomAssetManager.create(a, s),
};

// export const

export const runBackwards = async (clients) => {
  //try {
  const network_name = "harmony"; // Config[ConfigKeys.NETWORK_NAME];
  const network = routerConfig[network_name];
  const { host, multicall2, block_speed_in_seconds } = network as {
    [name: string]: string;
  };
  await setProvider(host, multicall2); // connects to the block chain
  const asset_mgr = await managers[network_name](); // getting map without exchange rates
  const all_cryptos = asset_mgr.all_cryptos;
  let all_exchange_pairs = asset_mgr.all_exchange_pairs;
  let initial_block_number = 32890978;
  for (let i = initial_block_number; i >= 0; i--) {
    const hmy_heartbeat = new Heartbeat2(
      all_exchange_pairs,
      all_cryptos,
      FixedNumber.from(block_speed_in_seconds)
    );
    hmy_heartbeat.current_block = i;
    await hmy_heartbeat.__execute_beat__(i.toString());
    all_exchange_pairs = [
      ...hmy_heartbeat.other_pairs,
      ...hmy_heartbeat.uniswap_pairs,
    ];
    const arb_cycle_resolver = new ArbitrageCycleResolver( // finding cycles in the map
      Object.values(hmy_heartbeat.all_cryptos),
      all_exchange_pairs
    );
    arb_cycle_resolver.resolve_cycles();
    const results = arb_cycle_resolver.get_cost_sorted_solutions();
    // if arb then write to db
    for (const arb of results) {
      await db_operations.db_import_arbs(
        network_name,
        hmy_heartbeat.current_block.toString(),
        arb[0].toString()
      );
    }
  }
};

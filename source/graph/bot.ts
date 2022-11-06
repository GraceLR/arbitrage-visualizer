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

export const runBot = async (clients) => {
  //try {
  const network_name = "harmony"; // Config[ConfigKeys.NETWORK_NAME];

  // const routerRaw = await fetch('./config/router_config.json' as any, {
  //     headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //     },
  // });

  // const routerConfig = (await routerRaw.json()) as any;

  const network = routerConfig[network_name];

  const { host, multicall2, block_speed_in_seconds } = network as {
    [name: string]: string;
  };
  await setProvider(host, multicall2); // connects to the block chain

  const asset_mgr = await managers[network_name](); // getting map without exchange rates
  const all_cryptos = asset_mgr.all_cryptos;
  const all_exchange_pairs = asset_mgr.all_exchange_pairs;

  while (true) {
    try {
      await run(
        all_cryptos,
        all_exchange_pairs,
        FixedNumber.from(block_speed_in_seconds),
        clients
      );
    } catch (e: any) {
      log_message(`error: ${e.toString().substring(0, 300)}`, LEVELS.ERROR);
      //throw e;
      await sleep(30);
      /*
            except RuntimeError as e:
                error("RPC node unresponsive. Waiting 30 seconds and reconnecting.")
                network.disconnect()
                time.sleep(30)
            except asyncio.exceptions.TimeoutError as e:
                error("Timeout error. Waiting 30 seconds and reconnecting.")
                network.disconnect()
                time.sleep(30)
            except asyncio.exceptions.CancelledError as e:
                error("Cancelled error. Waiting 30 seconds and reconnecting.")
                network.disconnect()
                time.sleep(30)
            except websockets.exceptions.ConnectionClosedError as e:
                error("ConnectionClosedError. Waiting 30 seconds and reconnecting.")
                network.disconnect()
                time.sleep(30)
            except requests.exceptions.HTTPError as e:
                error("HTTPError. Likely disconnect from server. Waiting 30 seconds and reconnecting.")
                // is_connected doesn't work properly sometimes after a disconnect.
                try:
                    if network.is_connected():
                        network.disconnect()
                except ConnectionError:
                    error("Wasn't connected.")
                time.sleep(20)
                */
    }
  }
  //} catch (e) {
  //console.error(`boom ${e}`);
  //throw e;
  // critical("Global Error: " + str(e))
  // exit(-1);
  //}
};

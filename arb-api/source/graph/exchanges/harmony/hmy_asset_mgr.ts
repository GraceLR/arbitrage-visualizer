import HarmonyCurveExchangeManager from "./hmy_crv_exchange_mgr";
import HarmonyUniswapV2ExchangeManager from "./hmy_uniswapv2_exchange_mgr";
import AssetManager from "../../domain/managers/asset_mgr";
import ExchangeManager from "../../domain/managers/exchange_mgr";

export default class HarmonyAssetManager extends AssetManager {
  curve_tokens = {
    "1eth": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013",
    "1usdc": "0x985458e523db3d53125813ed68c274899e9dfab4",
    "1usdt": "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f",
    "1dai": "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339",
    "1wbtc": "0x3095c7557bCb296ccc6e363DE01b760bA031F2d9",
  };

  static create = async () => {
    const obj = new HarmonyAssetManager();
    await AssetManager.initialize("harmony/hrc20", obj);
    return obj;
  };

  exchange_managers = (): (() => ExchangeManager)[] => [
    () => new HarmonyUniswapV2ExchangeManager(),
    () =>
      new HarmonyCurveExchangeManager({
        dai: this.all_cryptos["0xef977d2f931c1978db5f6747666fa1eacb0d0339"],
        "1usdc": this.all_cryptos["0x985458e523db3d53125813ed68c274899e9dfab4"],
        "1usdt": this.all_cryptos["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f"],
        "1wbtc": this.all_cryptos["0x3095c7557bcb296ccc6e363de01b760ba031f2d9"],
        "1eth": this.all_cryptos["0x6983d1e6def3690c4d616b13597a09e6193ea013"],
      }),
  ];
}

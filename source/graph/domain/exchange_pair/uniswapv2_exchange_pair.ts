import { BigNumber, FixedNumber } from "ethers";
import CryptoNode from "../crypto";
import ExchangePair from "./exchange_pair";
import { Contract } from "../../multicall";
import { multiply } from "../../utils/fixedNumberExtensions";
import { run } from "../../arb/providers";

// "forward" is crypto0 : crypto1, and reverse is 1 to 0
export default class UniswapV2ExchangePair extends ExchangePair {
  fraction = FixedNumber.from(0);
  reverse_fraction = FixedNumber.from(0);
  receipt_number = -1;
  pair_contract: Contract;
  crypto0_index: number = 0;
  crypto1_index: number = 0;
  exchange_fee: string;
  router_address = "";
  exchange_fee_multiplier: FixedNumber;

  constructor(
    exchange_name: string,
    crypto0: CryptoNode,
    crypto1: CryptoNode,
    pair_contract: Contract,
    router_address: string,
    exchange_fee = "0.3"
  ) {
    super(exchange_name, crypto0, crypto1, pair_contract);

    this.pair_contract = pair_contract;
    this.exchange_fee = exchange_fee;
    this.router_address = router_address;
    this.exchange_fee_multiplier = FixedNumber.from(1).subUnsafe(
      FixedNumber.from(exchange_fee).divUnsafe(FixedNumber.from(100))
    );
  }

  queue_refresh_call_data = (
    call_list: BigNumber[],
    call_receipt_number: number
  ) => {
    throw new Error("not implemented");
  };

  accept_refresh_call_data = (refresh_call_data: FixedNumber[][]) => {
    throw new Error("not implemented");
  };

  get_spending_contract_address = () => this.router_address;

  // Given a crypto and percentage, we return the resulting crypto and percentages after an exchange
  get_exchange_result = (
    crypto: CryptoNode,
    percentage: () => FixedNumber
  ): [CryptoNode, () => FixedNumber] => {
    if (crypto == this.crypto0) {
      return [
        this.crypto1,
        () =>
          multiply(
            multiply(percentage(), this.fraction),
            this.exchange_fee_multiplier
          ),
      ];
    } else if (crypto == this.crypto1) {
      return [
        this.crypto0,
        () =>
          multiply(
            multiply(percentage(), this.reverse_fraction),
            this.exchange_fee_multiplier
          ),
      ];
    } else {
      throw new Error("invalid crypto parameter in get_exchange_result()");
    }
  };

  fetchReserves = () => this.pair_contract.getReserves();

  fetchFractions = (): any => null;

  copy_except_cryptos = () =>
    new UniswapV2ExchangePair(
      this.exchange_name,
      this.crypto0,
      this.crypto1,
      this.pair_contract,
      this.router_address,
      this.exchange_fee
    );

  // uni2 = [[0, 0], "0x7b886d19e5EE9E3188Eb29037dE21Dce944aE0Ef", 2]
  build_exchange_call = (
    from_crypto: CryptoNode
  ): [[number, number], string, number] => [
    [0, 0],
    this.get_spending_contract_address(),
    2,
  ];
}

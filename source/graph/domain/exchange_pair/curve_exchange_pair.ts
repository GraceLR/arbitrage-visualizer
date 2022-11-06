/*
import brownie
from printer.process import info

from domain.crypto import CryptoNode
from domain.exchange_pair import ExchangePair
*/

import { FixedNumber, ethers, BigNumber } from "ethers";
import CryptoNode from "../crypto";
import ExchangePair from "./exchange_pair";
import { isNil } from "ramda";
import { Contract } from "../../multicall";
import { LEVELS, log_message } from "../../utils/print";
import { multiply } from "../../utils/fixedNumberExtensions";

// "forward" is crypto0 : crypto1, and reverse is 1 to 0
export default class CurveExchangePair extends ExchangePair {
  receipt_number = -1;
  metapool_contract: Contract;
  crypto0_index: number = 0;
  crypto1_index: number = 0;
  exchange_fee_multiplier = FixedNumber.from("0.9996");

  constructor(
    metapool_contract: Contract,
    crypto0: CryptoNode,
    crypto0_zap_index: number,
    crypto1: CryptoNode,
    crypto1_zap_index: number
  ) {
    super("Curve", crypto0, crypto1, metapool_contract);

    this.metapool_contract = metapool_contract;
    // For clarity, the following two are zap/meta underlying indexes
    this.crypto0_index = crypto0_zap_index;
    this.crypto1_index = crypto1_zap_index;
  }

  queue_refresh_call_data = (
    call_list: BigNumber[],
    call_receipt_number: number
  ) => {
    this.receipt_number = call_receipt_number;

    call_list.push(
      this.metapool_contract.get_dy_underlying(
        this.crypto0_index,
        this.crypto1_index,
        this.crypto0.get_approx_one_usd_in_units()
      )
    );

    call_list.push(
      this.metapool_contract.get_dy_underlying(
        this.crypto1_index,
        this.crypto0_index,
        this.crypto1.get_approx_one_usd_in_units()
      )
    );
  };

  // fraction and reverse fraction try to estimate the slope of the exchange curve
  // However, while we're looking for the slope dy/dx, we notice that the axis have different scales and adjust
  accept_refresh_call_data = (refresh_call_data: FixedNumber[]) => {
    let call_one = refresh_call_data[this.receipt_number];
    let call_two = refresh_call_data[this.receipt_number + 1];

    if (isNil(call_one)) {
      log_message(
        `metapool_contract.get_dy_underlying(${this.crypto0_index},${
          this.crypto1_index
        },${this.crypto0.get_approx_one_usd_in_units()}) returned None`,
        LEVELS.ERROR
      );
    }
    if (isNil(call_two)) {
      log_message(
        `metapool_contract.get_dy_underlying(${this.crypto1_index},${
          this.crypto0_index
        },${this.crypto1.get_approx_one_usd_in_units()}) returned None`,
        LEVELS.ERROR
      );
    }

    if (isNil(call_one) || isNil(call_two)) {
      this.latest_refresh_successful = false;
      this.fraction = FixedNumber.from(0);
      this.reverse_fraction = FixedNumber.from(0);
    } else {
      this.latest_refresh_successful = true;
      this.fraction = FixedNumber.from(call_one).divUnsafe(
        FixedNumber.from(this.crypto0.get_approx_one_usd_in_units())
      );
      this.reverse_fraction = FixedNumber.from(call_two).divUnsafe(
        FixedNumber.from(this.crypto1.get_approx_one_usd_in_units())
      );
    }
  };

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

  get_spending_contract_address = () => this.metapool_contract.address;

  copy_except_cryptos = () =>
    new CurveExchangePair(
      this.metapool_contract,
      this.crypto0,
      this.crypto0_index,
      this.crypto1,
      this.crypto1_index
    );

  build_exchange_call = (
    from_crypto: CryptoNode
  ): [[number, number], string, number] => {
    let from_index = 0;
    let to_index = 0;

    if (from_crypto === this.crypto0) {
      from_index = this.crypto0_index;
      to_index = this.crypto1_index;
    } else if (from_crypto == this.crypto1) {
      from_index = this.crypto1_index;
      to_index = this.crypto0_index;
    } else {
      throw new Error("curve_exchange_pair invalid from_crypto");
    }

    // [[0, 1], "0x76147c0C989670D106b57763a24410A2a22e335E", 1]
    return [[from_index, to_index], this.metapool_contract.address, 1];
  };
}

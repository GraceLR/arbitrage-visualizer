/*
from brownie import Contract
from brownie.convert import EthAddress
*/

import { FixedNumber } from "ethers";
import { without } from "ramda";
import { runOne } from "../arb/providers";
import { Contract } from "../multicall";
import { max, multiply, pow } from "../utils/fixedNumberExtensions";
import ExchangePair from "./exchange_pair/exchange_pair";

export default class CryptoNode {
  name: string;
  contract: Contract;
  precision: number;
  precision_full: FixedNumber;
  is_stable: boolean;
  exchange_pairs: ExchangePair[] = [];

  constructor(
    name: string,
    contract: Contract,
    precision: number,
    is_stable: boolean
  ) {
    this.name = name;
    this.contract = contract;
    this.precision = precision;
    this.is_stable = is_stable;
    this.precision_full = pow("10", precision);
  }

  get_approx_one_usd_in_units = () => {
    // Replace this eventually, for now take a guess

    if (this.is_stable) {
      return this.precision_full;
    }

    const amounts: FixedNumber[] = [];
    for (const pair of this.exchange_pairs) {
      if (!pair.reserves_in_usd.isZero()) {
        const reserves = pair.get_reserves(this);
        amounts.push(
          multiply(reserves, this.precision_full).divUnsafe(
            pair.reserves_in_usd
          )
        );
      }
    }
    return max(amounts).mulUnsafe(FixedNumber.from(2));
  };

  add_exchange_pair = (exchange_pair: ExchangePair) => {
    this.exchange_pairs.push(exchange_pair);
  };

  remove_exchange_pair = (exchange_pair: ExchangePair) => {
    this.exchange_pairs = without([exchange_pair], this.exchange_pairs);
  };

  allowance = async (address: string, other_address: string) => {
    return await runOne(
      this.contract.allowance(address, other_address),
      this.contract.abi
    );
  };

  get_balance_of = async (address: string) =>
    await runOne(this.contract.balanceOf(address), this.contract.abi);

  get_contract_address = () => this.contract.address;

  remove_exchange_pair_by_crypto(other_crypto: CryptoNode) {
    this.exchange_pairs = [
      ...this.exchange_pairs.filter(
        (e) => e.get_other_crypto(this) !== other_crypto
      ),
    ];
  }

  toString = () => this.name;
}

import { BigNumber, FixedNumber } from 'ethers';
import { multiply } from '../../utils/fixedNumberExtensions';
import CryptoNode from '../crypto';

export default class ExchangePair {
    exchange_name: string;
    latest_block = 0;
    latest_refresh_successful = true;
    crypto0: CryptoNode;
    crypto1: CryptoNode;
    fraction = FixedNumber.from(0);
    reverse_fraction = FixedNumber.from(0);
    crypto0_amount = FixedNumber.from(0);
    crypto1_amount = FixedNumber.from(0);
    reserves_in_usd = FixedNumber.from(0);
    last_transaction = 0;

    constructor(
        exchange_name: string,
        crypto0: CryptoNode,
        crypto1: CryptoNode
    ) {
        this.exchange_name = exchange_name;
        this.crypto0 = crypto0;
        this.crypto1 = crypto1;

        crypto0.add_exchange_pair(this);
        crypto1.add_exchange_pair(this);
    }

    pair_name = () => `${this.crypto0.name}/${this.crypto1.name}`;

    get_qualified_name = () => `${this.exchange_name}-${this.pair_name()}`;

    has_stablecoin = () => this.crypto0.is_stable || this.crypto1.is_stable;

    get_stablecoin = () => {
        if (this.crypto0.is_stable) {
            return this.crypto0.is_stable;
        } else if (this.crypto1.is_stable) {
            return this.crypto1.is_stable;
        } else {
            throw new Error('crypto has no stablecoin');
        }
    };

    get_other_crypto = (crypto: CryptoNode) =>
        crypto == this.crypto1 ? this.crypto0 : this.crypto1;

    get_reserves = (crypto: CryptoNode) => {
        if (crypto == this.crypto0) {
            return this.crypto0_amount;
        } else if (crypto == this.crypto1) {
            return this.crypto1_amount;
        } else {
            throw new Error('invalid crypto parameter in get_reserves()');
        }
    };

    calc_fraction = (result: BigNumber | null) => {
        return this.crypto0_amount.isZero()
            ? this.crypto0_amount
            : multiply(
                  this.crypto1_amount.divUnsafe(this.crypto0_amount),
                  this.crypto1.precision_full.divUnsafe(
                      this.crypto0.precision_full
                  )
              );
    };

    set_amounts = (reserves: [BigNumber, BigNumber, number]) => {
        this.crypto0_amount = FixedNumber.from(reserves[0]).divUnsafe(
            this.crypto0.precision_full
        );
        this.crypto1_amount = FixedNumber.from(reserves[1]).divUnsafe(
            this.crypto1.precision_full
        );
        this.last_transaction = reserves[2];

        if (this.crypto0.is_stable) {
            this.set_reserves_in_usd(
                this.crypto0_amount.mulUnsafe(FixedNumber.from(2))
            );
        } else if (this.crypto1.is_stable) {
            this.set_reserves_in_usd(
                this.crypto1_amount.mulUnsafe(FixedNumber.from(2))
            );
        }
    };

    set_fractions = (fraction: FixedNumber) => {
        this.fraction = fraction;
        this.reverse_fraction = this.fraction.isZero()
            ? this.fraction
            : FixedNumber.from(1).divUnsafe(this.fraction);
    };

    set_reserves_in_usd = (amount: FixedNumber) => {
        this.reserves_in_usd = amount;
    };

    get_spending_contract_address = (): string => {
        throw new Error('Not implemented.');
    };

    get_exchange_result = (
        crypto: CryptoNode,
        percentage: () => FixedNumber
    ): [CryptoNode, () => FixedNumber] => {
        throw new Error('Not implemented.');
    };

    queue_refresh_call_data = (
        call_list: BigNumber[],
        call_receipt_number: number
    ): void => {
        throw new Error('Not implemented.');
    };

    accept_refresh_call_data = (refresh_call_data: any[]): void => {
        throw new Error('Not implemented.');
    };

    build_exchange_call = (
        from_crypto: CryptoNode
    ): [[number, number], string, number] => {
        throw new Error('Not implemented.');
    };

    copy_except_cryptos = (): ExchangePair => {
        throw new Error('Not implemented');
    };

    toString = () => this.get_qualified_name;
}

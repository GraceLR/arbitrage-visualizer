// alright so the FixedNumber operations are hilariously slow, we are going to have to cache the results to get any performance at all.

import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { FixedNumber } from 'ethers';
import { isNil } from 'ramda';
import { LEVELS, log_message } from './print';

let _multCache: Map<string, Map<string, FixedNumber>> = new Map();
let entries = 0;
let hits = 0;
const MAX_ENTRIES = 1000000;

export function multiply(
    a: FixedNumber | string,
    b: FixedNumber | string
): FixedNumber {
    const _a = typeof a === 'string' ? FixedNumber.from(a) : (a as FixedNumber);
    const _b = typeof b === 'string' ? FixedNumber.from(b) : (b as FixedNumber);

    if (entries > MAX_ENTRIES) {
        log_message(
            `cleaning mult cache. Hit rate: ${(hits / entries) * 100}%`,
            LEVELS.DEBUG
        );
        _multCache = new Map();
        entries = 0;
        hits = 0;
    }

    let first = _multCache.get(_a._value);

    if (!first) {
        first = new Map();
        _multCache.set(_a._value, first);
    }

    let result = first.get(_b._value);

    if (!result) {
        result = _a.mulUnsafe(_b);
        first.set(_b._value, result);
        entries++;
    } else {
        hits++;
    }

    return result;
}

export function pow(a: FixedNumber | string, b: number) {
    if (a instanceof Number) {
        a = FixedNumber.from(a);
    }

    if (b < 0) {
        throw new Error(`pow() can't handle negative exponents`);
    } else {
        let ret = FixedNumber.from(1);

        for (let i = 0; i < b; i++) {
            ret = multiply(ret, a);
        }

        return ret;
    }
}

export function max(nums: FixedNumber[]) {
    if (isNil(nums) || nums.length === 0) {
        throw new Error(`nums is invalid in max()`);
    }

    let biggest = nums[0];
    for (let i = 1; i < nums.length; i++) {
        biggest = lessThan(biggest, nums[i]) ? nums[i] : biggest;
    }

    return biggest;
}

// doesn't handle negative numbers
export function lessThan(a: FixedNumber, b: FixedNumber) {
    const decimalA = a._value.indexOf('.');
    const decimalB = b._value.indexOf('.');

    // Check the digits to the left of the decimal first
    if (decimalA === decimalB) {
        for (let i = 0; i < a._value.length; i++) {
            if (i === decimalA) {
                continue;
            }
            const diff = a._value.charCodeAt(i) - b._value.charCodeAt(i);

            if (diff === 0) {
                continue;
            }

            return diff < 0;
        }
    } else {
        return decimalA < decimalB;
    }

    return a._value.length < b._value.length;
}

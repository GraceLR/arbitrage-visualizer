import { FixedNumber } from 'ethers';

// If the last transaction date is before this number, ignore the pair. This should be automated
export const HARMONY_MIN_BLOCK = 1000; // 1650000000

// For concurrent operations, use this many threads
export const CONCURRENCY = 16;

// Only use pairs over this number
export const MIN_LIQUIDITY_IN_USD = FixedNumber.from(10000);

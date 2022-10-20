import { ethers } from "ethers";
import { splitEvery } from "ramda";
import { ContractCall, Provider } from "../multicall";
import { LEVELS, log_message } from "../utils/print";
import { sleep } from "../utils/sleep";

let provider: ethers.providers.JsonRpcProvider;
let multicallProvider: Provider;

export async function setProvider(network_name: string, multicall2: string) {
  provider = new ethers.providers.StaticJsonRpcProvider(network_name);

  // wait for provider to connect
  await provider._networkPromise;
  multicallProvider = new Provider(provider, multicall2);
}

export function getProvider() {
  return provider;
}

export async function runAll(
  contractCalls: ContractCall[],
  executeOnBlockNumber?: string
) {
  return (await run(contractCalls, executeOnBlockNumber)).results;
}

export async function run(
  contractCalls: ContractCall[],
  executeOnBlockNumber?: string
) {
  return run_internal(contractCalls, 512, 0, 0, executeOnBlockNumber);
}

async function run_internal(
  contractCalls: ContractCall[],
  batch_size,
  index,
  retry,
  executeOnBlockNumber?: string
) {
  let results: any[] = [];
  let blockNumber: number = -1;
  for (var chunk of splitEvery(batch_size, contractCalls)) {
    try {
      const res = await multicallProvider.all(chunk);
      blockNumber = res.blockNumber;
      results = [...results, ...res.results];
    } catch (e: any) {
      log_message(
        `range ${index}-${index + batch_size} failed. ${e.reason}`,
        LEVELS.ERROR
      );

      if (batch_size === 1) {
        if (retry > 0) {
          await sleep(1);
          await run_internal(
            chunk,
            batch_size,
            index,
            retry - 1,
            executeOnBlockNumber
          );
        } else {
          results.push(null);
        }
      } else {
        const res = await run_internal(
          chunk,
          Math.ceil(batch_size / 2),
          index,
          undefined,
          executeOnBlockNumber
        );
        blockNumber = res.blockNumber;
        results = [...results, ...res.results];
      }
    }
    index += chunk.length;
  }

  return { results, blockNumber };
}

export async function runOne(contract: ContractCall) {
  return (await run([contract], 1, 0, 9)).results[0];
}

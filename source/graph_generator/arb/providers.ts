import { ethers } from 'ethers';
import { splitEvery } from 'ramda';
import { ContractCall, Provider } from '../multicall';
// import { LEVELS, log_message } from '../utils/print';
import { sleep } from '../utils/sleep';

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

export async function runAll(contractCalls: ContractCall[], batch_size = 512) {
    return (await run(contractCalls, batch_size)).results;
}

export async function run(
    contractCalls: ContractCall[],
    batch_size = 512,
    index = 0,
    retry = 0
) {
    let results: any[] = [];
    let blockNumber: number = -1;
    for (var chunk of splitEvery(batch_size, contractCalls)) {
        try {
            const res = await multicallProvider.all(chunk);
            blockNumber = res.blockNumber;
            results = [...results, ...res.results];
        } catch (e: any) {
            // log_message(
            //     `range ${index}-${index + batch_size} failed. ${e.reason}`,
            //     LEVELS.ERROR
            // );

            if (batch_size === 1) {
                if (retry > 0) {
                    await sleep(1);
                    await run(chunk, batch_size, index, retry - 1);
                } else {
                    results.push(null);
                }
            } else {
                const res = await run(chunk, Math.ceil(batch_size / 2), index);
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

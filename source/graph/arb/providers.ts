import { ethers } from "ethers";
import R, { splitEvery } from "ramda";
import { LEVELS, log_message } from "../utils/print";
import { sleep } from "../utils/sleep";
import { ContractCallContext, Multicall } from "../multicall2";
import { Abi } from "../multicall/abi";

let blockNumber: number | undefined = undefined;
let provider: ethers.providers.BaseProvider;
let multicallProvider: Multicall;

export async function setProvider(network_name: string, multicall2: string) {
  provider = ethers.getDefaultProvider(network_name);

  // wait for provider to connect
  await provider._networkPromise;
  multicallProvider = new Multicall({
    web3Instance: provider,
    tryAggregate: true,
  });
}

export function setBlockNumber(blockNum: number | undefined) {
  blockNumber = blockNum;
}

export function getBlockNumber() {
  return blockNumber;
}

export function getProvider() {
  return provider;
}

export async function runAll(contractCalls: any[], abi: any[]) {
  return (await run(contractCalls, abi)).results;
}

export async function run(contractCalls: any[], abi: any[]) {
  if (contractCalls.length === 0) {
    return { results: [] };
  }

  let ret: any[] = [];
  let ret_block = -1;
  for (const calls of R.splitEvery(512, contractCalls)) {
    const res = await run_internal(calls, abi);
    ret_block = res.blockNumber;
    ret = [...ret, ...res.results];
  }

  return {
    blockNumber: ret_block,
    results: ret,
  };
}

async function run_internal(contractCalls: any[], abi: any[]) {
  let i = 0;
  const input = {};

  for (const call of contractCalls) {
    const addr = call.contract.address;

    if (!input[addr]) {
      input[addr] = {
        abi,
        reference: addr,
        contractAddress: addr,
        calls: [],
      };
    }

    input[addr].calls.push({
      reference: i,
      methodName: call.name,
      methodParameters: call.params,
    });

    i++;
  }

  const callData =
    blockNumber === undefined
      ? undefined
      : { blockNumber: blockNumber.toString() };
  const output = await multicallProvider.call(Object.values(input), callData);

  const returnVals: any[] = [];

  for (const callReturns of Object.values(output.results)) {
    for (const callReturn of callReturns.callsReturnContext) {
      if (callReturn.decoded && callReturn.success) {
        returnVals[parseInt(callReturn.reference)] =
          callReturn.returnValues.length === 1
            ? callReturn.returnValues[0]
            : callReturn.returnValues;
      } else {
        returnVals[parseInt(callReturn.reference)] = null;
      }
    }
  }

  const result = {
    blockNumber: output.blockNumber,
    results: returnVals,
  };

  return result;
}

export async function runOne(contract: any, abi: any[]) {
  const result = (await run([contract], abi)).results;
  return result[0];
}

/*
from brownie import Contract
from brownie.convert import EthAddress

from domain.crypto import CryptoNode
from domain.exchange_pair import ExchangePair
from harmony.hmy_crv_exchange_mgr import HarmonyCurveExchangeManager
from harmony.hmy_uniswapv2_exchange_mgr import HarmonyUniswapV2ExchangeManager
from contracts.scripts import load_abis
*/

import ExchangePair from '../exchange_pair/exchange_pair';
import { get_abi } from '../../utils/load_abis';
import CryptoNode from '../../domain/crypto';
import ExchangeManager from './exchange_mgr';

export default class AssetManager {
    base_abi: any = null;
    all_cryptos: { [name: string]: CryptoNode } = {};
    all_exchange_pairs: ExchangePair[] = [];

    static initialize = async (abi_location: string, obj: AssetManager) => {
        await obj.generate_all_exchange_pairs_and_cryptos();
        obj.base_abi = await get_abi(abi_location);
        return obj;
    };

    generate_all_exchange_pairs_and_cryptos = async () => {
        for (const mgr of this.exchange_managers()) {
            const [new_cryptos, new_pairs] =
                await mgr().generate_cryptos_and_exchange_pairs(
                    this.all_cryptos
                );
            this.all_cryptos = { ...this.all_cryptos, ...new_cryptos };
            this.all_exchange_pairs = [
                ...this.all_exchange_pairs,
                ...new_pairs,
            ];
        }
    };

    exchange_managers = (): (() => ExchangeManager)[] => {
        throw new Error('not implemented');
    };
}

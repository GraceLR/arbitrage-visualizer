import UniswapV2ExchangeManager from '../../domain/managers/uniswapv2_exchange_mgr';

export default class HarmonyUniswapV2ExchangeManager extends UniswapV2ExchangeManager {
    uniswap_router_v1_abi: any;
    uniswap_factory_abi: any;
    uniswap_pair_abi: any;

    constructor() {
        super('harmony');
    }

    exchanges = (): [string, string, string, string][] => [
        // (exchange_name, router_address, factory_address)
        [
            'dfk',
            '0x24ad62502d1C652Cc7684081169D04896aC20f30',
            '0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7',
            '0.3',
        ],
        [
            'sushi',
            '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
            '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
            '0.3',
        ],
        [
            'viper',
            '0xf012702a5f0e54015362cBCA26a26fc90AA832a3',
            '0x7D02c116b98d0965ba7B642ace0183ad8b8D2196',
            '0.3',
        ],
        [
            'open',
            '0x2F99992024DCC51324BA4956bB1c510F36FA54F5',
            '0x5d2F9817303b940C9bB4F47C8C566c5C034d9848',
            '0.3',
        ],
        [
            'fox',
            '0x32253394e1C9E33C0dA3ddD54cDEff07E457A687',
            '0xfA53b963A39621126bf45F647F813952cD3c5C66',
            '0.3',
        ],
        [
            'defira',
            '0x3c8bf7e25ebfaafb863256a4380a8a93490d8065',
            '0xF166939E9130b03f721B0aE5352CCCa690a7726a',
            '0.3',
        ],
    ];

    stable_coins = () => ({
        usdt: true,
        usdc: true,
        frax: true,
        dai: true,
        busd: true,
        '1usdc': true,
    });
}

import CryptoNode from '../../domain/crypto';
import ExchangePair from '../exchange_pair/exchange_pair';

export default class ExchangeManager {
    generate_cryptos_and_exchange_pairs = async (crypto_dict: {
        [name: string]: CryptoNode;
    }): Promise<[{ [name: string]: CryptoNode }, ExchangePair[]]> => {
        throw new Error('not implemented');
    };
}

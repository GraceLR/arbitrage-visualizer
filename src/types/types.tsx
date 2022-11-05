export interface Arb {
    id: number;
    chain: string;
    block_number: number;
    created_on: Date;
    expected_profit: number;
}

export interface Exchangepair {
    id: number;
    arbitrage_id: number;
    crypto_id_0: number;
    crypto_id_1: number;
    exchange_name: string;
    price_tangent: string;
    inverse_price_tangent: number;
    is_dynamic: boolean;
    exchange_type: string;
    position?: number;
}
export interface Crypto {
    id: number;
    arbitrage_id: number;
    crypto: string;
    contract_address: string;
    precision: number;
    is_stable: boolean;
    usd_price: number;
    wallet_amount: number;
}

export interface Map {
    exchangepair: Exchangepair[];
    crypto: Crypto[];
}
export interface GraphMap {
    counter: number;
    nodes: {
        id: number;
        label: any;
        color: string;
        x?: any;
        y?: any;
    }[];
    edges: { from: number; to: number }[];
}

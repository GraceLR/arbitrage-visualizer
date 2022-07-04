
export interface Arb {
    id: number,
    block: number,
    created_on: Date,
    profit: number
};

export interface Node {
    id: number,
    node_name: string,
    position: number,
    arb_id: number
};

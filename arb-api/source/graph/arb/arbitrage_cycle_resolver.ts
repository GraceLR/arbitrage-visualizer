import { FixedNumber } from 'ethers';
import { pipe, sort, takeWhile } from 'ramda';
import CryptoNode from '../domain/crypto';
import ExchangePair from '../domain/exchange_pair/exchange_pair';
import { lessThan } from '../utils/fixedNumberExtensions';

export default class ArbitrageCycleResolver {
    all_cryptos: CryptoNode[];
    all_exchange_pairs: ExchangePair[];
    solutions: [FixedNumber, CryptoNode[], ExchangePair[]][] = [];

    constructor(all_cryptos: CryptoNode[], all_exchange_pairs: ExchangePair[]) {
        this.all_cryptos = all_cryptos;
        this.all_exchange_pairs = all_exchange_pairs;
    }

    resolve_cycles = () => {
        this.solutions = [];

        for (const node of this.all_cryptos) {
            this.get_cycles_from(node, 3, FixedNumber.from(1));
        }
    };

    append_solution = (
        cost: FixedNumber,
        node_path: CryptoNode[],
        edge_path: ExchangePair[]
    ) => {
        const solution: [FixedNumber, CryptoNode[], ExchangePair[]] = [
            cost,
            node_path,
            edge_path,
        ];
        this.solutions.push(solution);
    };

    get_cost_sorted_solutions = (): [
        FixedNumber,
        CryptoNode[],
        ExchangePair[]
    ][] => {
        return pipe(
            sort(
                (
                    x: [FixedNumber, CryptoNode[], ExchangePair[]],
                    y: [FixedNumber, CryptoNode[], ExchangePair[]]
                ) => (lessThan(x[0], y[0]) ? 1 : -1)
            ),
            takeWhile((x: [FixedNumber, CryptoNode[], ExchangePair[]]) =>
                lessThan(FixedNumber.from(1), x[0])
            )
        )(this.solutions);
    };

    get_cycles_from = (
        current_node: CryptoNode,
        remaining_edges: number,
        starting_quantity: FixedNumber
    ) => {
        const queue: {
            current_node: CryptoNode;
            past_nodes: CryptoNode[];
            past_edges: ExchangePair[];
            current_quantity: () => FixedNumber;
        }[] = [];

        queue.push({
            current_node: current_node,
            past_nodes: [],
            past_edges: [],
            current_quantity: () => starting_quantity,
        });

        while (queue.length > 0) {
            const {
                current_node,
                past_nodes,
                past_edges,
                current_quantity,
            }: {
                current_node: CryptoNode;
                past_nodes: CryptoNode[];
                past_edges: ExchangePair[];
                current_quantity: () => FixedNumber;
            } = queue.pop() as any;

            // See if we've returned a full cycle. Ignore if size of past_nodes == 0 because it means we haven't moved yet.
            if (past_nodes.length > 0 && current_node === past_nodes[0]) {
                const quantity = current_quantity();

                if (lessThan(starting_quantity, quantity)) {
                    /*
                    log_message(
                        `start: ${starting_quantity.toString()}| end: ${current_quantity}| div: ${current_quantity.divUnsafe(
                            starting_quantity
                        )}`
                    );*/
                    past_nodes.push(current_node);
                    this.append_solution(
                        quantity.divUnsafe(starting_quantity),
                        past_nodes,
                        past_edges
                    );
                    continue;
                } else {
                    // we've returned full circle without profit. Return
                    continue;
                }
            }

            // If we've hit max cycle length without returning back to root node
            if (remaining_edges <= past_edges.length) {
                continue;
            }

            // We do a depth first search. Because edge length <= 5, we can brute force this.
            for (const exchangePair of current_node.exchange_pairs) {
                //  Quick check to make sure we don't use an exchange pair that failed to fetch
                if (!exchangePair.latest_refresh_successful) {
                    continue;
                }

                const [new_node, new_quantity] =
                    exchangePair.get_exchange_result(
                        current_node,
                        current_quantity
                    );

                queue.push({
                    current_node: new_node,
                    past_nodes: [...past_nodes, current_node],
                    past_edges: [...past_edges, exchangePair],
                    current_quantity: new_quantity,
                });
            }
        }
    };
}

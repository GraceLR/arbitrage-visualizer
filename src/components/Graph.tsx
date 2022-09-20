import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Map, GraphMap } from '../types/types';
import InnerGraphNew from './InnerGraphNew';

const options = {
    layout: {
        hierarchical: false,
    },
    edges: {
        color: '#000000',
    },
};

// function useStateRef<T>(
//     initialValue: T | (() => T)
// ): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
//     const [value, setValue] = React.useState(initialValue);

//     const ref = React.useRef(value);

//     React.useEffect(() => {
//         ref.current = value;
//     }, [value]);

//     return [value, setValue, ref];
// }

function Graph(props: { selected: number }) {
    // const [map, setMap] = useState<Map>();
    const [graphMap, setGraphMap] = useState<GraphMap>({
        counter: 0,
        nodes: [],
        edges: [],
    });
    // const [selectedNode, setSelectedNode, ref] = useStateRef<
    //     number | undefined
    // >(undefined);
    const [selectedNode, setSelectedNode] = useState(undefined);
    const events = {
        click: (properties: any) => {
            if (properties.event.srcEvent.shiftKey) {
                createNode(
                    properties.pointer.canvas.x,
                    properties.pointer.canvas.y,
                    selectedNode
                );
            }
        },
        select: (selected: any) => {
            if (!selected.event.srcEvent.shiftKey) {
                setSelectedNode((_prev: any) => selected.nodes[0]);
            }
        },
    };
    const createNode = (x: number, y: number, nodeId: number | undefined) => {
        if (nodeId === undefined) {
            alert('Please select a node.');
            return;
        }
        setGraphMap(({ counter, nodes, edges }) => {
            const id = counter - 1;
            const from = nodeId;

            const color = '#bdbdbd';
            const node = { id, label: `${id}`, color, x, y };
            const edge = { from, to: id };

            return {
                counter: id,
                nodes: [...nodes, node],
                edges: [...edges, edge],
            };
        });
    };
    useEffect(() => {
        const getMap = async (arb_id: number) => {
            const mapData = await axios.get<Map>(`/api/arbs/${arb_id}`);
            // setMap((_prev) => mapData.data);
            const nodesWithPos: { [key: number]: boolean } = {};
            const edges = mapData.data.exchangepair.map((p) => {
                const pos = p.position;
                let edgeColor = '#616161';
                if (pos !== null) {
                    edgeColor = '#d50000';
                    nodesWithPos[p.crypto_id_0] = true;
                    nodesWithPos[p.crypto_id_1] = true;
                }
                return {
                    // id: p.id,
                    from: p.crypto_id_0,
                    to: p.crypto_id_1,
                    color: edgeColor,
                    // show position
                };
            });

            const graph = {
                counter: 0,
                nodes: mapData.data.crypto.map((c) => ({
                    id: c.id,
                    label: c.crypto,
                    color: nodesWithPos[c.id] ? '#d50000' : '#bdbdbd',
                    // ask jason how to define the color
                })),
                edges: edges,
            };

            setGraphMap((_prev) => graph);
        };
        getMap(props.selected);
    }, [props.selected]);
    return (
        <>
            <InnerGraphNew
                graph={graphMap}
                options={options}
                events={events}
                style={{ height: '640px' }}
            />
        </>
    );
}

export default Graph;

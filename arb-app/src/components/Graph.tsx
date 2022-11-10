import React, { useState, useEffect } from 'react';
import NodesGraph from 'react-vis-ts';
import axios from 'axios';

import { Map, GraphMap } from '../types/types';
import icons from './assets/icons';

const genIcon = icons.GENERIC;
const options = {
    layout: {
        hierarchical: false,
    },
    nodes: {
        widthConstraint: { minimum: 50 },
    },
    edges: {
        color: '#000000',
        length: 200,
        smooth: { enabled: true, type: 'dynamic' },
    },
};

function Graph(props: {
    selected: number;
    selectedNode: any;
    setSelectedNode: any;
}) {
    const [graphMap, setGraphMap] = useState<GraphMap>({
        counter: 0,
        nodes: [],
        edges: [],
    });
    const events = {
        click: (properties: any) => {
            if (properties.event.srcEvent.shiftKey) {
                createNode(
                    properties.pointer.canvas.x,
                    properties.pointer.canvas.y,
                    props.selectedNode
                );
            }
        },
        select: (selected: any) => {
            if (!selected.event.srcEvent.shiftKey) {
                props.setSelectedNode((_prev: any) => selected.nodes[0]);
            }
        },
    };
    const createNode = async (
        x: number,
        y: number,
        nodeId: number | undefined
    ) => {
        if (nodeId === undefined) {
            alert('Please select a node.');
            return;
        }
        setGraphMap(({ counter, nodes, edges }) => {
            const id = counter - 1;
            const from = nodeId;
            const color = '#bdbdbd';
            const node = {
                id,
                label: id,
                shape: 'image',
                image: genIcon,
                color,
                x,
                y,
            };
            const edge = { from, to: id, label: 'added' };

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
                    label:
                        p.position !== null
                            ? p.position + ' /' + p.price_tangent
                            : p.price_tangent,
                    // show position
                };
            });
            const graph = {
                counter: 0,
                nodes: mapData.data.crypto.map((c) => {
                    const icon = (icons as any)[c.crypto];
                    return {
                        id: c.id,
                        // label: c.crypto,
                        label: 'label',
                        shape: 'image',
                        image: icon ?? genIcon,
                        color: nodesWithPos[c.id] ? '#d50000' : '#bdbdbd',
                        // ask jason how to define the color
                    };
                }),
                edges: edges,
            };
            setGraphMap((_prev) => graph);
        };
        getMap(props.selected);
    }, [props.selected]);
    return (
        <>
            <NodesGraph
                graph={graphMap}
                options={options}
                events={events}
                style={{ height: '640px' }}
            />
        </>
    );
}

export default Graph;

import React, { useState, useEffect } from 'react';
import InnerGraph from './InnerGraph';
import axios from 'axios';

import { Map, GraphMap } from '../types/types';

const options = {
    layout: {
        hierarchical: false,
    },
    edges: {
        color: '#000000',
    },
};
const events = {
    select: (selected: any) => {
        console.log(selected);
    },
};

function Graph(props: { selected: number }) {
    // const [map, setMap] = useState<Map>();
    const [graphMap, setGraphMap] = useState<GraphMap>();
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
                    id: p.id,
                    from: p.crypto_id_0,
                    to: p.crypto_id_1,
                    color: edgeColor,
                    // show position
                };
            });

            setGraphMap((_prev) => {
                return {
                    nodes: mapData.data.crypto.map((c) => ({
                        id: c.id,
                        label: c.crypto,
                        color: nodesWithPos[c.id] ? '#d50000' : '#bdbdbd',
                        // ask jason how to define the color
                    })),
                    edges: edges,
                };
            });
        };
        getMap(props.selected);
    }, [props.selected]);
    return (
        <>
            {graphMap && (
                <div>
                    <InnerGraph
                        graph={graphMap}
                        options={options}
                        events={events}
                        style={{ height: '640px' }}
                    />
                </div>
            )}
        </>
    );
}

export default Graph;

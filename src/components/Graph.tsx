import React, { useState, useEffect } from 'react';
import NetworkGraph from 'react-graph-vis';
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
    select: (nodes: any, edges: any) => {
        console.log('Selected nodes:');
        console.log(nodes);
        console.log('Selected edges:');
        console.log(edges);
        alert('Selected node: ' + nodes);
    },
};

function Graph(props: { selected: number }) {
    // const [map, setMap] = useState<Map>();
    const [graphMap, setGraphMap] = useState<GraphMap>();
    useEffect(() => {
        const getMap = async (arb_id: number) => {
            const mapData = await axios.get<Map>(`/api/arbs/${arb_id}`);
            // setMap((_prev) => mapData.data);
            setGraphMap((_prev) => {
                return {
                    nodes: mapData.data.crypto.map((c) => ({
                        id: c.id,
                        label: c.crypto,
                        color: '#e04141',
                    })),
                    edges: mapData.data.exchangepair.map((p) => ({
                        from: p.crypto_id_0,
                        to: p.crypto_id_1,
                    })),
                };
            });
        };
        getMap(props.selected);
    }, [props.selected]);
    return (
        <>
            {graphMap && (
                <div>
                    <NetworkGraph
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

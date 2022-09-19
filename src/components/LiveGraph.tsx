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

function Graph(props: { liveGraph: any }) {
    const edges = props.liveGraph.exchangepair.map((p: any) => {
        let edgeColor = '#616161';

        return {
            from: p.crypto_id_0,
            to: p.crypto_id_1,
            color: edgeColor,
        };
    });

    const graph = {
        counter: 0,
        nodes: props.liveGraph.crypto.map((c: any) => ({
            id: c.id,
            label: `${c.crypto}, ${c.usd_price}`,
            color: '#bdbdbd',
            // ask jason how to define the color
        })),
        edges: edges,
    };

    return (
        <>
            <InnerGraphNew
                graph={graph}
                options={options}
                style={{ height: '640px' }}
            />
        </>
    );
}

export default Graph;

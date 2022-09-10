import React, { useState, useEffect } from 'react';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';
import defaultsDeep from 'lodash/fp/defaultsDeep';

function InnerGraphNew(props: any) {
    const container = React.useRef<HTMLDivElement>(null);

    // Add events in from old way
    // Build a test case to compare performance
    // Optimize this

    if (container.current) {
        const edges = new DataSet();
        edges.add(props.graph.edges);
        const nodes = new DataSet();
        nodes.add(props.graph.nodes);

        const defaultOptions = {
            physics: {
                stabilization: false,
            },
            autoResize: false,
            edges: {
                smooth: false,
                color: '#000000',
                width: 0.5,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5,
                    },
                },
            },
        };

        // merge user provied options with our default ones
        const options = defaultsDeep(defaultOptions, props.options);

        new Network(
            container.current,
            {
                ...props.graph,
                edges: edges,
                nodes: nodes,
            },
            options
        );
    }

    const style = { width: '100%', height: '100%', ...props.style };

    return <div ref={container} style={style} />;
}

export default InnerGraphNew;

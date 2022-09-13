import React, { useState, useEffect } from 'react';
import { DataSet } from 'vis-data';
import { Network, NetworkEvents } from 'vis-network';
import defaultsDeep from 'lodash/fp/defaultsDeep';
import isEqual from 'lodash/isEqual';

function InnerGraphNew(props: any) {
    const container = React.useRef<HTMLDivElement>(null);
    const [nodes] = useState(new DataSet());
    const [edges] = useState(new DataSet());
    const [options] = useState();

    // add double click create node event
    // Build a test case to compare performance
    // Optimize this

    // in the array not in dataset
    // in the dataset not in array
    // in the array in the dataset not the same value


    if (container.current) {

        if (/* nodes is different from props.nodes */) {
            nodes.remove(nodesRemoved);
            nodes.add(nodesAdded);
            nodes.update(nodesChanged);
        }


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
        useEffect(() => {
            if (container.current) {
                const events = props.events || {};
        
                const netWork = new Network(
                    container.current,
                    {
                        ...props.graph,
                        edges: edges,
                        nodes: nodes,
                    },
                    options
                );
                for (const eventName of Object.keys(events)) {
                    netWork.on(eventName as NetworkEvents, events[eventName]);
                }
            }
        }, [container.current]);
    }

    const style = { width: '100%', height: '100%', ...props.style };

    return <div ref={container} style={style} />;
}

export default InnerGraphNew;

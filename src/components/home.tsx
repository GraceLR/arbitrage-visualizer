import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from './Dropdown';
import Graph from './Graph';
import { Arb } from '../types/types';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import LiveGraph from './LiveGraph';

function Home() {
    const [arbs, setArbs] = useState<Arb[]>([]);
    const [selected, setSelected] = useState<number>(-1);
    const [ws, setWebSocket] = useState<W3CWebSocket | null>(null);
    const [liveGraph, setLiveGraph] = useState<any>(null);

    useEffect(() => {
        const server = new W3CWebSocket('ws://127.0.0.1:8080');
        server.onmessage = (message) => {
            setLiveGraph(JSON.parse(message.data as string));
        };
        setWebSocket(server);
    }, []);

    useEffect(() => {
        axios.get<Arb[]>('/api/arbs').then((all) => {
            const arbs = all.data;
            setArbs((_prev) => arbs);
            setSelected((_prev) => arbs[0].id);
        });
    }, []);
    return (
        <>
            {/* {arbs.length > 0 && (
                <Dropdown arbs={arbs} setSelected={setSelected} />
            )}
            {selected > -1 && <Graph selected={selected} />} */}

            {liveGraph && <LiveGraph liveGraph={liveGraph} />}
        </>
    );
}

export default Home;

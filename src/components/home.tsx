import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from './Dropdown';
import Graph from './Graph';
import { Arb } from '../types/types';
import { w3cwebsocket } from 'websocket';
import LiveGraph from './LiveGraph';
import StatusDropdown from './StatusDropdown';

function Home() {
    const [statusSelected, setStatusSelected] = useState('static');
    const [arbs, setArbs] = useState<Arb[]>([]);
    const [selected, setSelected] = useState<number>(-1);
    const [ws, setWebSocket] = useState<w3cwebsocket | null>(null);
    const [liveGraph, setLiveGraph] = useState<any>(null);

    useEffect(() => {
        axios.get<Arb[]>('/api/arbs').then((all) => {
            const arbs = all.data;
            setArbs((_prev) => arbs);
            setSelected((_prev) => arbs[0].id);
        });
    }, []);
    useEffect(() => {
        if (statusSelected === 'live') {
            const server = new w3cwebsocket('ws://127.0.0.1:8080');
            server.onmessage = (message) => {
                setLiveGraph((_prev: any) =>
                    JSON.parse(message.data as string)
                );
            };
            setWebSocket((_prev: any) => server);
        } else {
            ws?.close();
        }
    }, [statusSelected]);
    // setWebSocket(server);
    // server.onmessage = (message) => {
    //     setLiveGraph(JSON.parse(message.data as string));
    // };
    return (
        <>
            <StatusDropdown setStatusSelected={setStatusSelected} />
            {statusSelected === 'static' && arbs.length > 0 && (
                <Dropdown arbs={arbs} setSelected={setSelected} />
            )}
            {statusSelected === 'static' && selected > -1 && (
                <Graph selected={selected} />
            )}
            {statusSelected === 'live' && liveGraph && (
                <LiveGraph liveGraph={liveGraph} />
            )}
        </>
    );
}

export default Home;

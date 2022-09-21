import React, { useState, useEffect } from 'react';
import { w3cwebsocket } from 'websocket';
import axios from 'axios';
import { AppBar, Toolbar, Box, Paper, Typography } from '@mui/material';

import Graph from './Graph';
import { Arb } from '../types/types';
import LiveGraph from './LiveGraph';
import NavTop from './NavTop';
import NavBottom from './NavBottom';
const pages = ['Products', 'Pricing', 'Blog'];

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
    return (
        <>
            <AppBar position="sticky">
                <NavTop />
                <NavBottom
                    arbs={arbs}
                    setSelected={setSelected}
                    statusSelected={statusSelected}
                    setStatusSelected={setStatusSelected}
                />
            </AppBar>
            {/* <StatusDropdown setStatusSelected={setStatusSelected} />
            {statusSelected === 'static' && arbs.length > 0 && (
                <Dropdown arbs={arbs} setSelected={setSelected} />
            )}
            {statusSelected === 'static' && selected > -1 && (
                <Graph selected={selected} />
            )}
            {statusSelected === 'live' && liveGraph && (
                <LiveGraph liveGraph={liveGraph} />
            )} */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '3vw',
                }}
            >
                <Box
                    sx={{
                        backgroundColor: '#e0e0e0',
                    }}
                >
                    {statusSelected === 'static' && selected > -1 && (
                        <Graph selected={selected} />
                    )}
                    {statusSelected === 'live' && liveGraph && (
                        <LiveGraph liveGraph={liveGraph} />
                    )}
                </Box>
                <Box
                    sx={{
                        backgroundColor: '#e0e0e0',
                    }}
                >
                    CONTENT
                </Box>
            </Box>
        </>
    );
}

export default Home;

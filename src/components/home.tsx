import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from './Dropdown';
import Graph from './Graph';
import { Arb } from '../types/types';

function Home() {
    const [arbs, setArbs] = useState<Arb[]>([]);
    const [selected, setSelected] = useState<number>(-1);
    useEffect(() => {
        axios.get<Arb[]>('/api/arbs').then((all) => {
            const arbs = all.data;
            setArbs((_prev) => arbs);
            setSelected((_prev) => arbs[0].id);
        });
    }, []);
    return (
        <>
            {arbs.length > 0 && (
                <Dropdown arbs={arbs} setSelected={setSelected} />
            )}
            {selected > -1 && <Graph selected={selected} />}
        </>
    );
}

export default Home;

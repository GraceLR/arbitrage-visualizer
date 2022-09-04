import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dropdown from './components/Dropdown';
import Graph from './components/Graph';
import { Arb } from './types/types';

function App() {
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
        <div className="App">
            {arbs.length > 0 && (
                <Dropdown
                    arbs={arbs}
                    selected={selected}
                    setSelected={setSelected}
                />
            )}
            {selected > -1 && <Graph selected={selected} />}
        </div>
    );
}

export default App;

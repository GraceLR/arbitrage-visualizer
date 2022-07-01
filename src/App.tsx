import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dropdown from './components/Dropdown';
import Graph from './components/Graph';
import { Arb } from './types/types';


function App() {
    const [apiStatus, setApiStatus] = useState<Arb[]>([]);
    useEffect(() => {
        axios.get<Arb[]>("/api")
        .then(all => {
            setApiStatus((_prev) => all.data);
        });
      }, []);

    return <div className="App">
        <Dropdown arbs={apiStatus} />
        </div>;
}

export default App;
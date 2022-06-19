import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [apiStatus, setApiStatus] = useState<any>(null);
    useEffect(() => {
        axios.get("/api")
        .then(all => {
            setApiStatus((_prev:any) => all.data.names);
        });
      }, []);
    return <div className="App">{apiStatus}</div>;
}

export default App;
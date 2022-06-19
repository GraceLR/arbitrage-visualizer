import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    // const [apiStatus, setApiStatus] = useState(null);

    // const getStatus = () =>
    //     axios.get('http://localhost:6060/status').then((res) => {
    //         console.log('#####', 'trigdered');
    //         setApiStatus(res.data.message);
    //     });

    let draft = undefined;
    axios.get('http://localhost:8080').then((res) => {
        console.log('axios.get triggered###########');
        draft = res;
        console.log(draft, 'draft###########');
    });

    return <div className="App">{draft}</div>;
}

export default App;

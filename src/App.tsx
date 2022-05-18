import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState(null);

  const getStatus = () => 
    axios.get("http://localhost:6060/status")
      .then(res => setApiStatus(res.data.message));

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          API STATUS: {apiStatus ?? "DOWN!!!"}
        </p>
        <button onClick={getStatus}>
          Fetch API Status
        </button>
      </header>
    </div>
  );
}

export default App;

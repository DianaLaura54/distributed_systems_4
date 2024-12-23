import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home'; 
import Create from './components/Create';
import Login from './components/Login';
import WebSocketChatBox from './components/WebSocketChatBox';

import './App.css';

function App() {
  return (
    <Router>
      <div className="main">
        <div className="content">
          <h2 className="main-header">PROJECT</h2>
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/login" element={<Login />} />
              <Route path="/WebSocketChatBox" element={<WebSocketChatBox />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

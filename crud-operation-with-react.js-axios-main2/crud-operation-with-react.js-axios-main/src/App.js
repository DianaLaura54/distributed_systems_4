// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'; 
import DevicePersonPage from './components/DevicePersonPage';
import Create from './components/Create';
import Read from './components/Read';
import Update from './components/Updated';
import Login from './components/Login';
import Create2 from './components/Create2';
import Read2 from './components/Read2';
import Read3 from './components/Read3';
import Update2 from './components/Updated2';
import Update3 from './components/Updated3';
import Choice from './components/Choice';
import Choice2 from './components/Choice2';
import Choice3 from './components/Choice3';
import Mapping from './components/Mapping';
import WebSocketChatBox from './components/WebSocketChatBox';
import Signup from './components/Signup';

import './App.css';

function App() {
  return (
    <Router>
      <div className="main">
        <div className="content">
          <h2 className="main-header">PROJECT</h2>
          <div>
            <Routes>
              {}
              <Route path="/" element={<Home />} />
              <Route path="/DevicePersonPage" element={<DevicePersonPage />} />
              <Route path="/create" element={<Create />} />
              <Route path="/login" element={<Login />} />
              <Route path="/read" element={<Read />} />
              <Route path="/update" element={<Update />} />
              <Route path="/create2" element={<Create2 />} />
              <Route path="/read2" element={<Read2 />} />
              <Route path="/update2" element={<Update2 />} />
              <Route path="/update3" element={<Update3 />} />
              <Route path="/choice" element={<Choice />} />
              <Route path="/choice3" element={<Choice3 />} />
              <Route path="/choice2" element={<Choice2 />} />
              <Route path="/mapping" element={<Mapping />} />
              <Route path="/read3" element={<Read3/>} />
              <Route path="/WebSocketChatBox" element={<WebSocketChatBox/>}/>
              <Route path="/Signup" element={<Signup/>}/>
             
        
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
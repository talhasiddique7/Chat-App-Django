import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChatRoom from './components/chat/ChatRoom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:roomName" element={<ChatRoom />} />
      </Routes>
    </div>
  );
}

export default App;

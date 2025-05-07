import React, { useState } from 'react';
import '../styles/Login.css';

const Login = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const finalRoomCode = isCreating ? generateRoomCode() : roomCode.trim();
      if (finalRoomCode) {
        onJoin(name.trim(), finalRoomCode, isCreating);
      }
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return (
    <div className="login-container">
      <h2>Live Poll Battle</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {!isCreating && (
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
          />
        )}
        <div className="login-actions">
          <button type="button" onClick={() => setIsCreating(false)}>Join Room</button>
          <button type="button" onClick={() => setIsCreating(true)}>Create Room</button>
          <button type="submit">Continue</button>
        </div>
      </form>
    </div>
  );
};

export default Login;

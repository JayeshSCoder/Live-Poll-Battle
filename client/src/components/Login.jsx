import React, { useState } from 'react';
import '../styles/Login.css';

const Login = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      if (isCreating) {
        // When creating a room, we don't need a room code as the server will generate it
        onJoin(name.trim(), '', isCreating);
      } else {
        // When joining, we need the room code
        const finalRoomCode = roomCode.trim();
        if (finalRoomCode) {
          onJoin(name.trim(), finalRoomCode, isCreating);
        } else {
          alert("Please enter a room code to join.");
        }
      }
    } else {
      alert("Please enter your name.");
    }
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
          <button
            type="button"
            className={!isCreating ? 'active' : ''}
            onClick={() => setIsCreating(false)}
          >
            Join Room
          </button>
          <button
            type="button"
            className={isCreating ? 'active' : ''}
            onClick={() => setIsCreating(true)}
          >
            Create Room
          </button>
          <button type="submit">Continue</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
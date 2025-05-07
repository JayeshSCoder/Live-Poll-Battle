import React, { useState, useEffect } from 'react';
import VoteOption from './VoteOption';
import Timer from './Timer';
import '../styles/PollRoom.css';

const PollRoom = ({ user, roomCode, onVote, votes, hasVoted, votingEnded, onExit }) => {

  const question = "Cats vs Dogs";

  return (
    <div className="poll-room">
      <h2>Room: {roomCode}</h2>
      <h3>Welcome, {user}!</h3>
      <h4>{question}</h4>

      <div className="options">
        <VoteOption
          option="Cats"
          votes={votes.Cats}
          onClick={() => onVote("Cats")}
          disabled={hasVoted || votingEnded}
        />
        <VoteOption
          option="Dogs"
          votes={votes.Dogs}
          onClick={() => onVote("Dogs")}
          disabled={hasVoted || votingEnded}
        />
      </div>

      {hasVoted && <p>You have voted!</p>}
      {votingEnded && <p>Voting has ended.</p>}

      <Timer votingEnded={votingEnded} />

      {votingEnded && (
        <button className="exit-button" onClick={onExit}>
          Exit Room
        </button>
      )}

    </div>
  );
};

export default PollRoom;

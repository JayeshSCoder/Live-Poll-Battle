import React from 'react';
import '../styles/VoteOption.css';

const VoteOption = ({ option, votes, onClick, disabled }) => {
  return (
    <div className={`vote-option ${disabled ? 'disabled' : ''}`} onClick={!disabled ? onClick : undefined}>
      <h4>{option}</h4>
      <p>{votes} votes</p>
    </div>
  );
};

export default VoteOption;

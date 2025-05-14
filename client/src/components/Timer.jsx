import React, { useState, useEffect } from 'react';
import '../styles/Timer.css';

const Timer = ({ votingEnded }) => {
  const [timeLeft, setTimeLeft] = useState(60); // Default 60 seconds voting time

  useEffect(() => {
    if (votingEnded || timeLeft <= 0) return;

    const roomCreatedAt = parseInt(localStorage.getItem('roomCreatedAt'), 10);

    if (roomCreatedAt) {
      const updateTimer = () => {
        
        const elapsedMs = Date.now() - roomCreatedAt;
        const remainingSecs = Math.max(0, Math.floor((60000 - elapsedMs) / 1000));

        setTimeLeft(remainingSecs);

        
        if (remainingSecs <= 0) {
          clearInterval(interval);
        }
      };

      
      updateTimer();

      
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [votingEnded]);

  return <div className="timer">⏱ Time Left: {timeLeft}s</div>;
};

export default Timer;
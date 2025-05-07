import React, { useEffect, useState } from 'react';
import '../styles/Timer.css';

const Timer = ({ votingEnded }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEndTime = localStorage.getItem('pollEndTime');
    const endTime = savedEndTime ? parseInt(savedEndTime) : Date.now() + 60000;
    localStorage.setItem('pollEndTime', endTime.toString());
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  });

  useEffect(() => {
    if (votingEnded || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEnded]);

  return <div className="timer">⏱ Time Left: {timeLeft}s</div>;
};

export default Timer;

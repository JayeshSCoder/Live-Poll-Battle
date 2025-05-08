import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PollRoom from './components/PollRoom';

const App = () => {
    const [user, setUser] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [votes, setVotes] = useState({ Cats: 0, Dogs: 0 });
    const [hasVoted, setHasVoted] = useState(false);
    const [votingEnded, setVotingEnded] = useState(false);
    const [ws, setWs] = useState(null); // WebSocket connection

    useEffect(() => {
        const vote = localStorage.getItem('vote');
        const room = localStorage.getItem('roomCode');
        const userName = localStorage.getItem('user');

        if (vote && room && userName) {
            setHasVoted(true);
            setRoomCode(room);
            setUser(userName);
            setInRoom(true);
        }

        const pollEndTime = parseInt(localStorage.getItem('pollEndTime'), 10);
        const interval = setInterval(() => {
            if (pollEndTime && Date.now() > pollEndTime) {
                setVotingEnded(true);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // WebSocket connection logic
    useEffect(() => {
        if (!ws) {
            const socket = new WebSocket('ws://localhost:5000');

            socket.onopen = () => {
                console.log('WebSocket connected');

                const storedRoom = localStorage.getItem('roomCode');
                const storedUser = localStorage.getItem('user');

                if (storedRoom && storedUser) {
                    const rejoinMessage = {
                        type: 'rejoin',
                        payload: {
                            roomCode: storedRoom,
                            userName: storedUser,
                        },
                    };
                    socket.send(JSON.stringify(rejoinMessage));
                }
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'joined' || data.type === 'rejoined') {
                    setVotes(data.payload.votes);
                    setInRoom(true); // ✅ Only set true here
                } else if (data.type === 'voteUpdate') {
                    setVotes(data.payload);
                } else if (data.type === 'error') {
                    alert(data.message);
                    localStorage.clear(); // clear bad data
                    setInRoom(false);
                }
            };

            socket.onclose = () => console.log('WebSocket disconnected');
            setWs(socket);
        }

        return () => {
            if (ws) ws.close();
        };
    }, [ws]);


    const handleJoin = (userName, roomCode, isCreating) => {
        setUser(userName);
        setRoomCode(roomCode);
        localStorage.setItem('user', userName);
        localStorage.setItem('roomCode', roomCode);

        const message = {
            type: 'join',
            payload: {
                roomCode,
                userName,
                isCreating,
            },
        };

        // Send the join request to the server
        if (ws) {
            ws.send(JSON.stringify(message));
        }

        if (isCreating) {
            // Reset votes and poll end time if creating a new room
            setVotes({ Cats: 0, Dogs: 0 });
            localStorage.removeItem('vote');
            localStorage.setItem('pollEndTime', Date.now() + 60000); // reset 60s timer
            setVotingEnded(false);
            setHasVoted(false);
        }
    };

    const handleVote = (option) => {
        if (hasVoted || votingEnded) return;

        const updatedVotes = { ...votes };
        updatedVotes[option] += 1;

        setVotes(updatedVotes);
        setHasVoted(true);
        localStorage.setItem('vote', option);

        const message = {
            type: 'vote',
            payload: {
                roomCode,
                option,
            },
        };
        ws.send(JSON.stringify(message));
    };

    const handleExit = () => {
        setInRoom(false);
        setUser('');
        setRoomCode('');
        setVotes({ Cats: 0, Dogs: 0 });
        setHasVoted(false);
        setVotingEnded(false);
        localStorage.clear();
    };

    return (
        <div>
            {!inRoom ? (
                <Login onJoin={handleJoin} />
            ) : (
                <PollRoom
                    user={user}
                    roomCode={roomCode}
                    onVote={handleVote}
                    votes={votes}
                    hasVoted={hasVoted}
                    votingEnded={votingEnded}
                    onExit={handleExit}
                />
            )}
        </div>
    );
};

export default App;

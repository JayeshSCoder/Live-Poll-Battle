import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PollRoom from './components/PollRoom';

const App = () => {
    const [user, setUser] = useState('');
    const [ws, setWs] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [votes, setVotes] = useState({ cats: 0, dogs: 0 });
    const [hasVoted, setHasVoted] = useState(false);
    const [votingEnded, setVotingEnded] = useState(false);

    
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedRoom = localStorage.getItem('roomCode');
        const savedVote = localStorage.getItem('vote');
        const roomCreatedAt = parseInt(localStorage.getItem('roomCreatedAt'), 10);

        if (savedUser && savedRoom) {
            setUser(savedUser);
            setRoomCode(savedRoom);
            setInRoom(true);

            if (savedVote) {
                setHasVoted(true);
            }

            
            if (roomCreatedAt && (Date.now() - roomCreatedAt > 60000)) {
                setVotingEnded(true);
            }
        }

        
        if (roomCreatedAt && !votingEnded) {
            const timeUntilEnd = Math.max(0, 60000 - (Date.now() - roomCreatedAt));

            if (timeUntilEnd <= 0) {
                setVotingEnded(true);
            } else {
                const timer = setTimeout(() => {
                    setVotingEnded(true);
                }, timeUntilEnd);

                return () => clearTimeout(timer);
            }
        }
    }, []);
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');

        socket.onopen = () => {
            console.log('WebSocket connected');
            setWs(socket);

            
            const savedUser = localStorage.getItem('user');
            const savedRoom = localStorage.getItem('roomCode');

            if (savedUser && savedRoom && inRoom) {
                const reconnectMsg = {
                    type: 'join_room',
                    roomCode: savedRoom,
                    username: savedUser
                };
                socket.send(JSON.stringify(reconnectMsg));
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);

                switch (data.type) {
                    case 'room_created':
                        
                        const room = data.data;
                        setInRoom(true);
                        setRoomCode(room.code);
                        setUser(room.users[0] || localStorage.getItem('user'));
                        setVotes(room.options);

                        // Save data to localStorage
                        localStorage.setItem('user', room.users[0] || localStorage.getItem('user'));
                        localStorage.setItem('roomCode', room.code);
                        localStorage.setItem('roomCreatedAt', room.createdAt);
                        break;

                    case 'poll_data':
                        
                        const joinedRoom = data.data;
                        setInRoom(true);
                        setRoomCode(joinedRoom.code);
                        setVotes(joinedRoom.options);

                        
                        if (joinedRoom.voters && joinedRoom.voters[user]) {
                            setHasVoted(true);
                            localStorage.setItem('vote', joinedRoom.voters[user]);
                        }

                        
                        localStorage.setItem('user', user);
                        localStorage.setItem('roomCode', joinedRoom.code);
                        localStorage.setItem('roomCreatedAt', joinedRoom.createdAt);

                        
                        if (Date.now() - joinedRoom.createdAt > 60000) {
                            setVotingEnded(true);
                        }
                        break;

                    case 'poll_update':
                        const updatedPoll = data.data;
                        setVotes(updatedPoll.options);

                        
                        if (updatedPoll.voters && updatedPoll.voters[user]) {
                            setHasVoted(true);
                        }
                        break;

                    case 'error':
                        alert(data.message);
                        
                        if (data.message === 'Room not found' || data.message === 'Username already taken') {
                            localStorage.removeItem('roomCode');
                            localStorage.removeItem('user');
                            localStorage.removeItem('vote');
                            localStorage.removeItem('roomCreatedAt');
                            setInRoom(false);
                        }
                        break;

                    default:
                        console.log('Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            setWs(null);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Clean up function
        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [user]);

    const handleJoin = (userName, roomCode, isCreating) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert('Connection to server lost. Please refresh the page.');
            return;
        }

        setUser(userName);

        if (isCreating) {
            const message = {
                type: "create_room",
                username: userName
            };
            ws.send(JSON.stringify(message));
        } else {
            const message = {
                type: "join_room",
                roomCode,
                username: userName
            };
            ws.send(JSON.stringify(message));
        }
    };

    const handleVote = (option) => {
        if (hasVoted || votingEnded || !ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }

        
        const normalizedOption = option.toLowerCase();

        const message = {
            type: 'vote',
            roomCode: roomCode,
            username: user,
            option: normalizedOption
        };

        ws.send(JSON.stringify(message));

        
        setHasVoted(true);
        localStorage.setItem('vote', normalizedOption);
    };

    const handleExit = () => {
        localStorage.removeItem('roomCode');
        localStorage.removeItem('user');
        localStorage.removeItem('vote');
        localStorage.removeItem('roomCreatedAt');

        // Reset state
        setInRoom(false);
        setUser('');
        setRoomCode('');
        setVotes({ cats: 0, dogs: 0 });
        setHasVoted(false);
        setVotingEnded(false);
    };

    
    const formattedVotes = {
        Cats: votes.cats || 0,
        Dogs: votes.dogs || 0
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
                    votes={formattedVotes}
                    hasVoted={hasVoted}
                    votingEnded={votingEnded}
                    onExit={handleExit}
                />
            )}
        </div>
    );
};

export default App;
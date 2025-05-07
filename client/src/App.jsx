import React, { useState, useEffect, useContext } from 'react';
import Login from './components/Login';
import PollRoom from './components/PollRoom';
import StoreContextProvider, { StoreContext } from './context/StoreContext';

const App = () => {

    const { user, setUser, roomCode, setRoomCode, inRoom, setInRoom, votes, setVotes, hasVoted, setHasVoted, votingEnded, setVotingEnded } = useContext(StoreContext)



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

    const handleJoin = (userName, roomCode, isCreating) => {
        setUser(userName);
        setRoomCode(roomCode);
        setInRoom(true);
        localStorage.setItem('user', userName);
        localStorage.setItem('roomCode', roomCode);
        if (isCreating) {
            setVotes({ Cats: 0, Dogs: 0 });
            localStorage.removeItem('vote');
            localStorage.setItem('pollEndTime', Date.now() + 60000);
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

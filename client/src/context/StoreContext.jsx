import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null)


const StoreContextProvider = (props) => {

    const [user, setUser] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [votes, setVotes] = useState({ Cats: 0, Dogs: 0 });
    const [hasVoted, setHasVoted] = useState(false);
    const [votingEnded, setVotingEnded] = useState(false);






    const contextValue = {
        user, setUser,
        roomCode, setRoomCode,
        inRoom, setInRoom,
        votes, setVotes,
        hasVoted, setHasVoted,
        votingEnded, setVotingEnded


    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
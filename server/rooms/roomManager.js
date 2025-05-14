const { generateRoomCode } = require('../utils/generateCode');

// Store all active rooms
const rooms = {};

function createRoom(creatorName) {
    const code = generateRoomCode();
    rooms[code] = {
        code,
        options: { cats: 0, dogs: 0 },
        voters: {},
        users: [creatorName],
        createdAt: Date.now(),
        endNotified: false
    };
    return rooms[code];
}

function joinRoom(code, username) {
    const room = rooms[code];
    if (!room) return { success: false, message: "Room not found" };

    if (room.users.includes(username)) {
        return { success: true, room };
    }

    room.users.push(username);
    return { success: true, room };
}

function voteInRoom(code, username, option) {
    const room = rooms[code];
    if (!room) return { success: false, message: "Room not found" };

    const votingTimeElapsed = Date.now() - room.createdAt;
    if (votingTimeElapsed > 60000) {
        return { success: false, message: "Voting time over" };
    }

    
    if (room.voters[username]) {
        return { success: false, message: "User already voted" };
    }

    
    const normalizedOption = option.toLowerCase();
    if (!room.options.hasOwnProperty(normalizedOption)) {
        return { success: false, message: "Invalid option" };
    }

    
    room.options[normalizedOption]++;
    room.voters[username] = normalizedOption;

    return { success: true, poll: room };
}

function getRoomPoll(code) {
    return rooms[code] || null;
}

function getAllClientsInRoom(wss, code) {
    return [...wss.clients].filter(ws =>
        ws.roomCode === code &&
        ws.readyState === ws.OPEN
    );
}



module.exports = {
    rooms,
    createRoom,
    joinRoom,
    voteInRoom,
    getRoomPoll,
    getAllClientsInRoom,
};
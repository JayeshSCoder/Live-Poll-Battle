const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require("cors")
const {
    createRoom,
    joinRoom,
    voteInRoom,
    getRoomPoll,
    getAllClientsInRoom,
} = require('./rooms/roomManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


app.use(cors())


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message);
            const { type, roomCode, username, option } = parsed;
            console.log(`Received ${type} message from ${username}`);

            if (type === 'create_room') {

                const room = createRoom(username);
                ws.username = username;
                ws.roomCode = room.code;

                console.log(`Room created: ${room.code} by ${username}`);

                ws.send(JSON.stringify({
                    type: 'room_created',
                    data: room
                }));
            }
            else if (type === 'join_room') {

                const result = joinRoom(roomCode, username);

                if (!result.success) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: result.message
                    }));
                } else {
                    ws.username = username;
                    ws.roomCode = roomCode;

                    console.log(`${username} joined room ${roomCode}`);

                    ws.send(JSON.stringify({
                        type: 'poll_data',
                        data: result.room
                    }));

                    getAllClientsInRoom(wss, roomCode).forEach(client => {
                        if (client !== ws) {
                            client.send(JSON.stringify({
                                type: 'user_joined',
                                username: username
                            }));
                        }
                    });
                }
            }
            else if ('vote') {

                if (!ws.roomCode || !ws.username) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'You must join a room first'
                    }));
                    return;
                }

                console.log(`${username} voting for ${option} in room ${ws.roomCode}`);

                const voteResult = voteInRoom(ws.roomCode, ws.username, option);

                if (!voteResult.success) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: voteResult.message
                    }));
                    return;
                }


                const updatedPoll = getRoomPoll(ws.roomCode);

                getAllClientsInRoom(wss, ws.roomCode).forEach(client => {
                    client.send(JSON.stringify({
                        type: 'poll_update',
                        data: updatedPoll
                    }));
                });
            }
            else {

                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unknown message type'
                }));
            }
        }
        catch (err) {
            console.error('Error processing message:', err);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${ws.username || 'unknown'}`);
    });
});


function getAllRoomCodes() {
    return Object.keys(require('./rooms/roomManager').rooms || {});
}

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


const rooms = {};

function handleConnection(ws, wss) {
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.error('Invalid JSON:', err);
            return;
        }

        const { type, payload } = data;



        if (type === 'join') {
            const { roomCode, userName, isCreating } = payload;

            if (!rooms[roomCode]) {
                if (isCreating) {
                    rooms[roomCode] = {
                        users: new Set(),
                        votes: { Cats: 0, Dogs: 0 },
                    };
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
                    return;
                }
            }

            rooms[roomCode].users.add(ws);
            ws.roomCode = roomCode;
            ws.userName = userName;

            ws.send(JSON.stringify({ type: 'joined', payload: { roomCode, votes: rooms[roomCode].votes } }));
        }

        else if (type === 'rejoin') {
            const { roomCode, userName } = payload;

            if (!rooms[roomCode]) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                return;
            }

            // Optionally re-add user
            rooms[roomCode].users.push({ name: userName, ws });

            ws.send(
                JSON.stringify({
                    type: 'rejoined',
                    payload: {
                        votes: rooms[roomCode].votes,
                    },
                })
            );
        }


        else if (type === 'vote') {
            const { roomCode, option } = payload;

            if (rooms[roomCode]) {
                rooms[roomCode].votes[option]++;
                broadcast(roomCode, {
                    type: 'voteUpdate',
                    payload: rooms[roomCode].votes,
                });
            }
        }
    });



    ws.on('close', () => {
        const { roomCode } = ws;
        if (roomCode && rooms[roomCode]) {
            rooms[roomCode].users.delete(ws);
            if (rooms[roomCode].users.size === 0) {
                delete rooms[roomCode];
            }
        }
    });
}

function broadcast(roomCode, message) {
    const room = rooms[roomCode];
    if (!room) return;

    for (const client of room.users) {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    }
}

module.exports = { handleConnection };

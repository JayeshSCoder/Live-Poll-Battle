const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { handleConnection } = require('./rooms/roomManager');


const PORT = process.env.PORT || 5000;


function startServer() {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        handleConnection(ws, wss);
    });

    app.get('/', (req, res) => {
        res.send('Live Poll Battle backend is running.');
    });

    server.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

module.exports = startServer;

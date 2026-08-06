const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const checkEnv = require('./src/utils/envCheck');
checkEnv(); // Validate environment before starting
const app = require('./app');
const chatSocket = require('./src/sockets/chatSocket');

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
  },
});

// Expose io to the app so it can be used in controllers
app.set('io', io);

// Initialize real-time chat
chatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

const chatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (Socket: ${socket.id})`);

    socket.on('join_room', ({ targetUserId }) => {
      const id1 = socket.user.id;
      const id2 = targetUserId;
      // Deterministic room ID ensuring same room regardless of who initiated
      const roomId = id1 < id2 ? `chat_${id1}_${id2}` : `chat_${id2}_${id1}`;
      socket.join(roomId);
      console.log(`User ${socket.user.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.user.id;

        // Save message to DB
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content
          }
        });

        // Create notification for receiver
        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'NEW_MESSAGE',
            message: `You have a new message from a user.`
          }
        });

        const roomId = senderId < receiverId ? `chat_${senderId}_${receiverId}` : `chat_${receiverId}_${senderId}`;
        
        // Emit to the room
        io.to(roomId).emit('receive_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('get_history', async ({ targetUserId }) => {
      try {
        const userId = socket.user.id;
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: userId }
            ]
          },
          orderBy: { timestamp: 'desc' },
          take: 50
        });

        // Reverse to send in chronological order
        socket.emit('chat_history', messages.reverse());
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

module.exports = chatSocket;

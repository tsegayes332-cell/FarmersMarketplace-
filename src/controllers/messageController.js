const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

const getChatHistory = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      orderBy: { timestamp: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });

    // Group by partner and get last message
    const partnerMap = {};
    for (const msg of conversations) {
      const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      if (!partnerMap[partnerId]) {
        const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
        partnerMap[partnerId] = {
          id: partnerId,
          partner: { id: partner.id, name: partner.name },
          lastMessage: msg.content,
          timestamp: msg.timestamp
        };
      }
    }

    res.status(200).json(Object.values(partnerMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getChatHistory,
  getConversations
};

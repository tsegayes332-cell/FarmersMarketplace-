const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getChatHistory);

module.exports = router;

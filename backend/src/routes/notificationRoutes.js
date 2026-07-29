const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id', notificationController.markAsRead);

module.exports = router;

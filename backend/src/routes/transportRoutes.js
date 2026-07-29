const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// TRANSPORTER routes
router.get(
  '/my',
  roleMiddleware(['TRANSPORTER']),
  transportController.getMyTransports
);

router.put(
  '/:id/status',
  roleMiddleware(['TRANSPORTER']),
  transportController.updateTransportStatus
);

// FARMER routes
router.post(
  '/order/:id/assign',
  roleMiddleware(['FARMER', 'ADMIN']),
  transportController.assignTransporter
);

// BUYER, FARMER, TRANSPORTER routes
router.get(
  '/order/:id',
  roleMiddleware(['BUYER', 'FARMER', 'TRANSPORTER']),
  transportController.getOrderTransport
);

module.exports = router;

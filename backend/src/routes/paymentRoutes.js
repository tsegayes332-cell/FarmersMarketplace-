const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public route for Chapa Webhook
router.post('/webhook', paymentController.chapaWebhook);

// Protected routes
router.use(authMiddleware);

router.post(
  '/initiate',
  roleMiddleware(['BUYER']),
  paymentController.initiatePayment
);

router.get(
  '/:orderId',
  roleMiddleware(['BUYER']),
  paymentController.getPaymentStatus
);

module.exports = router;

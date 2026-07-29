const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// BUYER routes
router.post(
  '/',
  roleMiddleware(['BUYER']),
  orderController.placeOrder
);

router.get(
  '/my',
  roleMiddleware(['BUYER']),
  orderController.getMyOrders
);

router.get(
  '/:id/track',
  roleMiddleware(['BUYER']),
  orderController.trackOrder
);

// FARMER routes
router.get(
  '/farmer',
  roleMiddleware(['FARMER']),
  orderController.getFarmerOrders
);

// FARMER, BUYER, or ADMIN routes
router.put(
  '/:id/status',
  roleMiddleware(['FARMER', 'BUYER', 'ADMIN']),
  orderController.updateOrderStatus
);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.deactivateUser);

router.get('/products', adminController.getAllProducts);
router.delete('/products/:id', adminController.removeProduct);

router.get('/reports', adminController.getReports);
router.get('/stats', adminController.getPlatformStats);

module.exports = router;

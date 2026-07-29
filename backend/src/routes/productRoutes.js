const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (FARMER only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['FARMER']),
  upload.single('image'),
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['FARMER']),
  upload.single('image'),
  productController.updateProduct
);

// Protected routes (FARMER or ADMIN)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['FARMER', 'ADMIN']),
  productController.deleteProduct
);

module.exports = router;

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public route
router.get('/:userId', reviewController.getReviews);

// Protected route
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['BUYER']),
  reviewController.createReview
);

module.exports = router;

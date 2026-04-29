const router = require('express').Router();
const {
  createReview,
  getReviewsByRoom,
  getAllReviews,
  deleteReview,
} = require('../controllers/reviews');
const { auth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

// Public route - anyone can submit a review
router.post('/', createReview);

// Public route - fetch reviews for a specific room
router.get('/room/:roomId', getReviewsByRoom);

// Admin routes
router.get('/', auth, itsAdmin, getAllReviews);
router.delete('/:reviewId', validateMongoId, auth, itsAdmin, deleteReview);

module.exports = router;

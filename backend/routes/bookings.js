const router = require('express').Router();
const {
  createBooking,
  getMyBookings,
  getBookingsByEmail,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  updateBookingPaymentStatus,
  deleteBooking,
} = require('../controllers/bookings');
const { auth, optionalAuth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

// Booking creation - allows both authenticated users and guests (optionalAuth)
router.route('/').post(optionalAuth, createBooking).get(auth, itsAdmin, getAllBookings);

// Guest bookings - retrieve by email (no auth required)
router.route('/guest/by-email').post(getBookingsByEmail);

// Authenticated user routes
router.route('/my-bookings').get(auth, getMyBookings);
router.route('/:id').get(validateMongoId, auth, getBookingById);
router.route('/:id/cancel').patch(validateMongoId, optionalAuth, cancelBooking);
router.route('/:id').delete(validateMongoId, auth, itsAdmin, deleteBooking);

// Admin controls
router.route('/:id/status').patch(validateMongoId, auth, itsAdmin, updateBookingStatus);
router.route('/:id/payment').patch(validateMongoId, auth, itsAdmin, updateBookingPaymentStatus);

module.exports = router;

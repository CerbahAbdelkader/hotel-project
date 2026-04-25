const router = require('express').Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookings');
const { auth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

router.route('/').post(auth, createBooking).get(auth, itsAdmin, getAllBookings);
router.route('/my-bookings').get(auth, getMyBookings);
router.route('/:id').get(validateMongoId, auth, getBookingById);
router.route('/:id/cancel').patch(validateMongoId, auth, cancelBooking);

module.exports = router;

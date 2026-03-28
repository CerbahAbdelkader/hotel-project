const router = require('express').Router();
const {
  createEventReservation,
  getAllEventReservations,
  getEventReservationById,
  updateEventReservationStatus,
} = require('../controllers/eventReservations');
const { auth, optionalAuth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

// Public endpoint for guests/users to submit event reservation requests.
router.route('/').post(optionalAuth, createEventReservation).get(auth, itsAdmin, getAllEventReservations);

// Admin controls.
router.route('/:id').get(validateMongoId, auth, itsAdmin, getEventReservationById);
router.route('/:id/status').patch(validateMongoId, auth, itsAdmin, updateEventReservationStatus);

module.exports = router;

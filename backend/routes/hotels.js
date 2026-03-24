const router = require('express').Router();
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotels');
const { auth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

router.route('/').get(getHotels).post(auth, itsAdmin, createHotel);
router.route('/:id').get(validateMongoId, getHotelById).patch(validateMongoId, auth, itsAdmin, updateHotel).delete(validateMongoId, auth, itsAdmin, deleteHotel);

module.exports = router;

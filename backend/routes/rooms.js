const router = require('express').Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
<<<<<<< HEAD
  checkRoomAvailability,
=======
>>>>>>> origin/main
} = require('../controllers/rooms');
const { auth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

router.route('/').get(getRooms).post(auth, itsAdmin, createRoom);
router.route('/:id').get(validateMongoId, getRoomById).patch(validateMongoId, auth, itsAdmin, updateRoom).delete(validateMongoId, auth, itsAdmin, deleteRoom);
<<<<<<< HEAD
router.route('/availability').get(checkRoomAvailability);
=======
>>>>>>> origin/main

module.exports = router;

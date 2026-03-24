const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { StatusCodes } = require('http-status-codes');

const getRooms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hotelId) {
      filter.hotel = req.query.hotelId;
    }

    const rooms = await Room.find(filter).populate('hotel', 'name city');
    return res.status(StatusCodes.OK).json({ rooms });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name city address');
    if (!room) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
    }
    return res.status(StatusCodes.OK).json({ room });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { hotel: hotelId } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Hotel not found' });
    }

    const room = await Room.create(req.body);
    hotel.rooms.push(room._id);
    await hotel.save();

    return res.status(StatusCodes.CREATED).json({ room });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
    }

    if (req.body.hotel && String(req.body.hotel) !== String(existingRoom.hotel)) {
      const newHotel = await Hotel.findById(req.body.hotel);
      if (!newHotel) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'New hotel not found' });
      }

      await Hotel.findByIdAndUpdate(existingRoom.hotel, { $pull: { rooms: existingRoom._id } });
      await Hotel.findByIdAndUpdate(newHotel._id, { $addToSet: { rooms: existingRoom._id } });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('hotel', 'name city');

    return res.status(StatusCodes.OK).json({ room });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
    }

    await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: room._id } });
    return res.status(StatusCodes.OK).json({ message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};

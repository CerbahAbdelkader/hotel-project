const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { StatusCodes } = require('http-status-codes');

const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('rooms');
    return res.status(StatusCodes.OK).json({ hotels });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('rooms');
    if (!hotel) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Hotel not found' });
    }
    return res.status(StatusCodes.OK).json({ hotel });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    return res.status(StatusCodes.CREATED).json({ hotel });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('rooms');

    if (!hotel) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Hotel not found' });
    }

    return res.status(StatusCodes.OK).json({ hotel });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Hotel not found' });
    }

    await Room.deleteMany({ hotel: hotel._id });
    return res.status(StatusCodes.OK).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};

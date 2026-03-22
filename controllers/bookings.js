const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { StatusCodes } = require('http-status-codes');

const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.available) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Room is not available' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid booking dates' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'checkOut must be after checkIn' });
    }

    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * room.price;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
    });

    room.available = false;
    await room.save();

    return res.status(StatusCodes.CREATED).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'roomNumber type price hotel')
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({ bookings });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room', 'roomNumber type price hotel')
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({ bookings });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber type price hotel');

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    const isOwner = String(booking.user._id) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    return res.status(StatusCodes.OK).json({ booking });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    const isOwner = String(booking.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Room.findByIdAndUpdate(booking.room, { available: true });

    return res.status(StatusCodes.OK).json({ message: 'Booking cancelled', booking });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
};

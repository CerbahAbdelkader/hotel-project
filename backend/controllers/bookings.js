const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone } = req.body;

    if (!roomId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'roomId is required' });
    }

    // Guard against invalid ObjectId values to avoid cast exceptions and generic 500 errors.
    if (!mongoose.Types.ObjectId.isValid(String(roomId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid roomId' });
    }

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

    // For authenticated users, use user ID. For guests, use guest info.
    const bookingData = {
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
    };

    if (req.user) {
      // Authenticated user booking
      bookingData.user = req.user._id;
    } else {
      // Guest booking - requires name and phone, email is optional
      if (!guestName || !guestPhone) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          message: 'For guest bookings, guestName and guestPhone are required' 
        });
      }
      bookingData.guestName = guestName;
      if (guestEmail) {
        bookingData.guestEmail = guestEmail;
      }
      bookingData.guestPhone = guestPhone;
    }

    const booking = await Booking.create(bookingData);

    // Update only availability to avoid failing on unrelated legacy room field validation.
    await Room.findByIdAndUpdate(roomId, { available: false });

    return res.status(StatusCodes.CREATED).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid booking payload' });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Keep room availability in sync with status updates from admin panel.
    if (status === 'approved') {
      await Room.findByIdAndUpdate(booking.room, { available: false });
    }
    if (status === 'rejected' || status === 'cancelled') {
      await Room.findByIdAndUpdate(booking.room, { available: true });
    }

    return res.status(StatusCodes.OK).json({ message: 'Booking status updated', booking });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowed = ['paid', 'unpaid'];

    if (!allowed.includes(paymentStatus)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid paymentStatus value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    return res.status(StatusCodes.OK).json({ message: 'Booking payment status updated', booking });
  } catch (error) {
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

const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email is required' });
    }

    const bookings = await Booking.find({ guestEmail: email })
      .populate('room', 'roomNumber type price hotel')
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No bookings found for this email' });
    }

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

    // Check if authenticated user is the owner OR if guest provided their email
    const isAuthenticatedOwner = req.user && String(booking.user?._id) === String(req.user._id);
    const isAdmin = req.user?.role === 'admin';
    const isGuestByEmail = req.body?.email && booking.guestEmail === req.body.email;

    if (!isAuthenticatedOwner && !isAdmin && !isGuestByEmail && req.user) {
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

    // Check authorization: owner (user or guest), admin, or guest providing email/phone verification
    const isAuthenticatedOwner = req.user && String(booking.user) === String(req.user._id);
    const isAdmin = req.user?.role === 'admin';
    const isGuestByEmail = req.body?.email && booking.guestEmail === req.body.email;
    const isGuestByNameAndPhone = req.body?.guestName && req.body?.guestPhone && 
      booking.guestName === req.body.guestName && 
      booking.guestPhone === req.body.guestPhone;

    if (!isAuthenticatedOwner && !isAdmin && !isGuestByEmail && !isGuestByNameAndPhone) {
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
  getBookingsByEmail,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  updateBookingPaymentStatus,
};

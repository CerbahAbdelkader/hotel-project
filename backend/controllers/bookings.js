const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const {
  CONFIRMATION_DEADLINE_HOURS,
  PAYMENT_DEADLINE_HOURS,
  addHours,
  normalizeBookingStatus,
  canTransitionBookingStatus,
  getRoomStatusFromBookingStatus,
  getBookingStateUpdate,
} = require('../utils/bookingWorkflow');

const ROOM_BOOKING_LOCK_STATUSES = ['reserved', 'occupied', 'maintenance'];

const syncRoomWithBookingStatus = async (booking, status) => {
  const roomStatus = getRoomStatusFromBookingStatus(status);
  if (!roomStatus) return;

  await Room.findByIdAndUpdate(booking.room, {
    status: roomStatus,
    available: roomStatus === 'available',
  });
};

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
    const roomStatus = room?.status || (room?.maintenanceNote ? 'maintenance' : room?.available === false ? 'reserved' : 'available');
    if (!room || ROOM_BOOKING_LOCK_STATUSES.includes(roomStatus) || roomStatus === 'maintenance' || room.available === false) {
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
      status: 'pending_confirmation',
      paymentStatus: 'unpaid',
      confirmationDeadline: addHours(new Date(), CONFIRMATION_DEADLINE_HOURS),
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

    await Room.findByIdAndUpdate(roomId, { status: 'reserved', available: false });

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
    const { status, cancelReason } = req.body;
    const nextStatus = normalizeBookingStatus(status);

    if (!nextStatus) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (!canTransitionBookingStatus(currentStatus, nextStatus)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status transition' });
    }

    if ((nextStatus === 'cancelled' || nextStatus === 'expired') && !cancelReason) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cancellation reason is required' });
    }

    const bookingUpdate = getBookingStateUpdate({
      nextStatus,
      cancelReason,
      createdAt: booking.createdAt,
    });

    booking.status = bookingUpdate.status;
    if (bookingUpdate.paymentStatus) booking.paymentStatus = bookingUpdate.paymentStatus;
    if (bookingUpdate.confirmationDeadline !== undefined) booking.confirmationDeadline = bookingUpdate.confirmationDeadline;
    if (bookingUpdate.paymentDeadline !== undefined) booking.paymentDeadline = bookingUpdate.paymentDeadline;
    if (bookingUpdate.cancelReason !== undefined) booking.cancelReason = bookingUpdate.cancelReason;
    await booking.save();

    if (booking.status === 'checked_in') {
      await Room.findByIdAndUpdate(booking.room, { status: 'occupied', available: false });
    } else if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'expired') {
      await Room.findByIdAndUpdate(booking.room, { status: 'available', available: true });
    } else if (booking.status === 'paid' || booking.status === 'awaiting_payment' || booking.status === 'confirmed' || booking.status === 'pending_confirmation') {
      await syncRoomWithBookingStatus(booking, booking.status);
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

    const currentStatus = normalizeBookingStatus(booking.status);

    booking.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      booking.status = 'paid';
      booking.paymentDeadline = null;
      if (currentStatus === 'pending_confirmation' || currentStatus === 'confirmed' || currentStatus === 'awaiting_payment') {
        await Room.findByIdAndUpdate(booking.room, { status: 'reserved', available: false });
      }
    } else if (currentStatus === 'paid') {
      booking.status = 'awaiting_payment';
      booking.paymentDeadline = addHours(new Date(), PAYMENT_DEADLINE_HOURS);
    }
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
    booking.cancelReason = req.body?.cancelReason || 'Customer request';
    booking.paymentStatus = 'unpaid';
    booking.paymentDeadline = null;
    await booking.save();

    await Room.findByIdAndUpdate(booking.room, { status: 'available', available: true });

    return res.status(StatusCodes.OK).json({ message: 'Booking cancelled', booking });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
    }

    await Room.findByIdAndUpdate(booking.room, { status: 'available', available: true });
    await Booking.findByIdAndDelete(req.params.id);

    return res.status(StatusCodes.OK).json({ message: 'Booking deleted successfully' });
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
  deleteBooking,
};

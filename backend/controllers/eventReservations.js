const { StatusCodes } = require('http-status-codes');
const EventReservation = require('../models/EventReservation');

const createEventReservation = async (req, res) => {
  try {
    const {
      clientName,
      email,
      phone,
      eventType,
      guests,
      startDate,
      endDate,
      services,
      message,
    } = req.body;

    if (!clientName || !phone || !eventType || !guests || !startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'clientName, phone, eventType, guests, startDate and endDate are required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid startDate or endDate' });
    }
    if (end < start) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'endDate must be after or equal to startDate' });
    }

    const reservation = await EventReservation.create({
      clientName: String(clientName).trim(),
      email: email ? String(email).trim().toLowerCase() : undefined,
      phone: String(phone).trim(),
      eventType: String(eventType).trim(),
      guests: Number(guests),
      startDate: start,
      endDate: end,
      services: Array.isArray(services) ? services : [],
      message: message ? String(message).trim() : '',
      createdBy: req.user?._id,
    });

    return res.status(StatusCodes.CREATED).json({
      message: 'Event reservation created successfully',
      reservation,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getAllEventReservations = async (req, res) => {
  try {
    const reservations = await EventReservation.find().sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ reservations });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const getEventReservationById = async (req, res) => {
  try {
    const reservation = await EventReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Event reservation not found' });
    }
    return res.status(StatusCodes.OK).json({ reservation });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

const updateEventReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'contacted', 'confirmed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status value' });
    }

    const reservation = await EventReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Event reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    return res.status(StatusCodes.OK).json({
      message: 'Event reservation status updated',
      reservation,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  createEventReservation,
  getAllEventReservations,
  getEventReservationById,
  updateEventReservationStatus,
};

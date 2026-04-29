const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchAdmin = async (req, res) => {
  try {
    const queryText = String(req.query.q || '').trim();

    if (!queryText) {
      return res.status(StatusCodes.OK).json({ bookings: [], rooms: [], users: [] });
    }

    const query = new RegExp(escapeRegExp(queryText), 'i');

    const users = await User.find({
      $or: [
        { name: query },
        { email: query },
        { phone: query },
      ],
    })
      .select('_id name email phone role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const matchedUserIds = users.map((user) => user._id);

    const [rooms, bookings] = await Promise.all([
      Room.find({
        $or: [
          { name: query },
          { roomNumber: query },
          { type: query },
        ],
      })
        .select('_id name roomNumber type price available image createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({
        $or: [
          { guestName: query },
          { guestPhone: query },
          ...(matchedUserIds.length ? [{ user: { $in: matchedUserIds } }] : []),
        ],
      })
        .populate('user', 'name email phone role')
        .populate('room', 'name roomNumber type price available')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(StatusCodes.OK).json({
      bookings: bookings.map((booking) => ({
        id: booking._id,
        guestName: booking.guestName || booking.user?.name || 'Réservation',
        guestPhone: booking.guestPhone || booking.user?.phone || '',
        guestEmail: booking.guestEmail || booking.user?.email || '',
        roomName: booking.room?.name || (booking.room?.roomNumber ? `Chambre ${booking.room.roomNumber}` : 'Chambre'),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
      })),
      rooms: rooms.map((room) => ({
        id: room._id,
        name: room.name || (room.roomNumber ? `Chambre ${room.roomNumber}` : 'Chambre'),
        roomNumber: room.roomNumber,
        type: room.type,
        price: room.price,
        available: room.available,
        image: room.image || '',
      })),
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      })),
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  searchAdmin,
};
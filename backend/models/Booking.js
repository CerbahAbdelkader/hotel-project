const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for guest bookings
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  // Guest booking info (used when user is not logged in)
  guestName: { type: String, required: false },
  guestEmail: { type: String, required: false },
  guestPhone: { type: String, required: false },
  // Extended status model to match admin dashboard actions.
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'confirmed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

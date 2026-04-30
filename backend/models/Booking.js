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
  // Reservation workflow state used by the confirmation/payment automation.
  status: { type: String, enum: ['pending_confirmation', 'confirmed', 'awaiting_payment', 'paid', 'checked_in', 'completed', 'cancelled', 'expired', 'pending', 'approved', 'rejected'], default: 'pending_confirmation' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  confirmationDeadline: { type: Date },
  paymentDeadline: { type: Date },
  cancelReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

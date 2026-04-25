const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  clientName: String,
  email: String,
  phone: String,
  eventType: String,
  guests: Number,
  startDate: Date,
  endDate: Date,
  services: [String],
  message: String,
  status: String,
  createdAt: Date,
});

module.exports = mongoose.model('EventReservation', reservationSchema);
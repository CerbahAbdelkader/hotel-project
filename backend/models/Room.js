const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true },
  type: { type: String, enum: ['single', 'double', 'suite'], required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  maxGuests: { type: Number, default: 2 }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

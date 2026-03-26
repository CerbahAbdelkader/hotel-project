const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true },
  name: { type: String },
  type: { type: String, enum: ['single', 'double', 'suite', 'classic', 'superior', 'deluxe', 'family'], required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  maxGuests: { type: Number, default: 2 },
  size: { type: Number }, // size in m²
  floor: { type: Number, default: 1 },
  description: { type: String },
  image: { type: String }, // URL or base64 image data
  amenities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

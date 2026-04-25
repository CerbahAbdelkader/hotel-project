const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: String,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  rating: { type: Number, default: 0 },
  images: [String],
  pricePerNight: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);

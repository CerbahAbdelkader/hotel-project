const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true },
  name: { type: String },
  type: { type: String, enum: ['single', 'double', 'suite', 'classic', 'superior', 'deluxe', 'family'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'reserved', 'occupied', 'maintenance'], default: 'available' },
  available: { type: Boolean, default: true },
  maintenanceNote: { type: String, default: '' },
  maxGuests: { type: Number, default: 2 },
  size: { type: Number }, // size in m²
  floor: { type: Number, default: 1 },
  description: { type: String },
  image: { type: String }, // URL or base64 image data
  amenities: [{ type: String }],
}, { timestamps: true });

roomSchema.pre('validate', function syncAvailability(next) {
  if (this.status === 'maintenance') {
    this.available = false
  } else if (this.status === 'available') {
    this.available = true
  } else if (this.status === 'reserved' || this.status === 'occupied') {
    this.available = false
  }

  if (!this.status) {
    this.status = this.available ? 'available' : 'reserved'
  }

  next()
})

module.exports = mongoose.model('Room', roomSchema);

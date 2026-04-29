const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  name: { type: String, required: true, trim: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5, 
    validate: { validator: Number.isInteger, message: 'Rating must be an integer' } 
  },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fetching reviews by room
reviewSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

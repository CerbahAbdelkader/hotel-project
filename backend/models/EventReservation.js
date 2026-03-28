const mongoose = require('mongoose');

const eventReservationSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'clientName is required'],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'phone is required'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required'],
      trim: true,
    },
    guests: {
      type: Number,
      required: [true, 'guests is required'],
      min: 1,
    },
    startDate: {
      type: Date,
      required: [true, 'startDate is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'endDate is required'],
    },
    services: {
      type: [String],
      default: [],
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventReservation', eventReservationSchema);

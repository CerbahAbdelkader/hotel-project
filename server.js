// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const ConnectDB = require('./database/connect');

const authRoutes = require('./routes/user');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');

// Routes الجديدة للـ Events
const eventRoutes = require('./routes/eventRoutes');
const hallRoutes = require('./routes/hallRoutes');
const packageRoutes = require('./routes/packageRoutes');
const eventStepRoutes = require('./routes/eventStepRoutes');
const eventReservationRoutes = require('./routes/eventReservationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const seedAdmin = require('./config/seedAdmin'); // استيراد إنشاء admin

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Return a clear message when request JSON is malformed.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format in request body' });
  }
  return next(err);
});

// Routes القديمة
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Routes الجديدة
app.use('/api/events', eventRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/event-steps', eventStepRoutes);
app.use('/api/event-reservations', eventReservationRoutes);
app.use('/api/services', serviceRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 3000;

const Start = async () => {
  try {
    await ConnectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1); // exit with failure
  }
};

Start();
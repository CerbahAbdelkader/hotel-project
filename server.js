const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const ConnectDB = require('./database/connect');
const authRoutes = require('./routes/user');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');

const seedAdmin = require('./config/seedAdmin'); // إنشاء admin

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Root route (حل مشكلة Cannot GET /)
app.get('/', (req, res) => {
  res.send('Hotel Booking API is running');
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 3000;

const Start = async () => {
  try {
    await ConnectDB(process.env.MONGO_URI);

    // إنشاء admin عند تشغيل السيرفر
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

Start();
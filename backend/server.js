const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const net = require('net');
require('dotenv').config();
const ConnectDB = require('./database/connect')
const authRoutes = require('./routes/user');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const eventReservationRoutes = require('./routes/eventReservations');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const { expireOverdueBookings } = require('./utils/bookingWorkflow');
const Booking = require('./models/Booking');
const Room = require('./models/Room');

const seedAdmin = require('./config/seedAdmin'); // استيراد إنشاء admin

const app = express();
let bookingWorkflowInterval = null;

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/event-reservations', eventReservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// الاتصال بقاعدة البيانات
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

// Return true when a port is available for binding.
const isPortAvailable = (port) => new Promise((resolve) => {
  const tester = net.createServer();

  tester.once('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      resolve(false);
      return;
    }
    resolve(false);
  });

  tester.once('listening', () => {
    tester.close(() => resolve(true));
  });

  // Use Node/Express default bind behavior (usually ::) to avoid false positives on Windows.
  tester.listen(port);
});

// Find the next free port starting from the configured default.
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port += 1;
  }
  return port;
};

const Start = async () => {
  try {
    await ConnectDB(process.env.MONGO_URI);

    const runBookingWorkflow = async () => {
      try {
        await expireOverdueBookings({ Booking, Room });
      } catch (error) {
        console.error('Booking workflow job failed:', error.message);
      }
    };

    await runBookingWorkflow();
    bookingWorkflowInterval = setInterval(runBookingWorkflow, 5 * 60 * 1000);
    const port = await findAvailablePort(DEFAULT_PORT);

    if (port !== DEFAULT_PORT) {
      console.warn(`⚠️ Port ${DEFAULT_PORT} is in use. Falling back to port ${port}.`);
    }

    app.listen(port, () => {
      console.log(`🚀 Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1); // exit with failure
  }
};

process.on('SIGINT', () => {
  if (bookingWorkflowInterval) clearInterval(bookingWorkflowInterval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (bookingWorkflowInterval) clearInterval(bookingWorkflowInterval);
  process.exit(0);
});

Start();
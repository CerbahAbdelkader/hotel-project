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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/event-reservations', eventReservationRoutes);

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

Start();
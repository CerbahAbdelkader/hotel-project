const express = require('express');
const Booking = require('../models/Booking');
const { auth, itsAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, itsAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('hotel');
    res.json(bookings);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, user: req.user._id });
    await booking.save();
    res.status(201).json(booking);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user').populate('hotel');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, itsAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json({ msg: 'Booking deleted' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
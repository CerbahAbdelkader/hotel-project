const express = require('express');
const Hotel = require('../models/Hotel');
const { auth, itsAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('rooms');
    res.json(hotels);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('rooms');
    if (!hotel) return res.status(404).json({ msg: 'Hotel not found' });
    res.json(hotel);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, itsAdmin, async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, itsAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ msg: 'Hotel not found' });
    res.json(hotel);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, itsAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ msg: 'Hotel not found' });
    res.json({ msg: 'Hotel deleted' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
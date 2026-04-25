const express = require('express');
const EventReservation = require('../models/EventReservation');

const router = express.Router();

// GET جميع الحجوزات
router.get('/', async (req, res) => {
  const data = await EventReservation.find();
  res.json(data);
});

// POST حجز جديد
router.post('/', async (req, res) => {
  const newReservation = new EventReservation(req.body);
  await newReservation.save();
  res.json(newReservation);
});

module.exports = router;
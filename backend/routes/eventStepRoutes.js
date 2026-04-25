const express = require('express');
const EventStep = require('../models/EventStep');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await EventStep.find();
  res.json(data);
});

module.exports = router;
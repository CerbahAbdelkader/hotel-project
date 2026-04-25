const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await Event.find();
  res.json(data);
});

module.exports = router;
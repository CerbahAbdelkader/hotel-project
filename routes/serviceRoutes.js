const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await Service.find();
  res.json(data);
});

module.exports = router;
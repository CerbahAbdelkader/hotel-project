const express = require('express');
const Package = require('../models/Package');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await Package.find();
  res.json(data);
});

module.exports = router;
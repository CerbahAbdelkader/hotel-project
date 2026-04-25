const express = require('express');
const Hall = require('../models/Hall');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await Hall.find();
  res.json(data);
});

module.exports = router;
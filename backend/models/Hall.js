const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: String,
  capacity: String,
  description: String,
  image: String,
});

module.exports = mongoose.model('Hall', hallSchema);
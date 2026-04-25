const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: Number,
  icon: String,
  title: String,
  description: String,
});

module.exports = mongoose.model('Service', serviceSchema);
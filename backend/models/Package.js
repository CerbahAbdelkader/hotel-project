const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: String,
  icon: String,
  items: [String],
});

module.exports = mongoose.model('Package', packageSchema);
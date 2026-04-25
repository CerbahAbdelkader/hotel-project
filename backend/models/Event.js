const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  key: String,
  title: String,
  description: String,
  image: String,
  icon: String,
});

module.exports = mongoose.model('Event', eventSchema);
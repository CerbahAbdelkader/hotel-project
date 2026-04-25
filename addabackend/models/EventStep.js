const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  icon: String,
  title: String,
});

module.exports = mongoose.model('EventStep', stepSchema);
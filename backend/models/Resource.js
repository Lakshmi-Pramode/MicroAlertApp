const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  contact: String,
  location: String
});

module.exports = mongoose.model('Resource', ResourceSchema);
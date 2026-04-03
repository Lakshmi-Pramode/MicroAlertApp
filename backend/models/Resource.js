const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  contact: String,
  location: String,

  // ✅ NEW FIELDS
  type: String,   // shelter / food / medical

  coordinates: {
    latitude: Number,
    longitude: Number
  }

}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: String,
  contact: String,
  location: String, // Stores the Address Name
  type: String, 
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, default: 'user' }, // Can be 'user' or 'admin'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
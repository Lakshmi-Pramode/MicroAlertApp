const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String },
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
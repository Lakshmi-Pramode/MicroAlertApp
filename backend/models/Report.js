const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({

    disasterType: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    // 🚨 NEW FIELD: Stores the human-readable address (e.g., "Saintgits College, Kottayam")
    address: {
        type: String,
        trim: true
    },

    mediaUrl: {
        type: String
    },

    mediaType: {
        type: String,
        enum: ['photo', 'video'],
        default: 'photo'
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number] // [longitude, latitude]
        }
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // ⭐ NEW FIELD (URGENT DETECTION)
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal'
    },

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    verifiedAt: {
        type: Date
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    timestamps: true
});

// Create a geospatial index for proximity searches
ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
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

    // Stores the human-readable address (e.g., "Saintgits College, Kottayam")
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

    // URGENT DETECTION
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal'
    },

    // 🚨 FIX: ADDED AI FIELDS HERE SO MONGOOSE DOES NOT DELETE THEM
    riskScore: { 
        type: Number, 
        default: 0 
    },
    
    aiNotes: { 
        type: String, 
        default: '' 
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
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

    // Media (Photo or Video)
    mediaUrl: {
        type: String
    },

    mediaType: {
        type: String,
        enum: ['photo', 'video']
    },

    // Geo Location (Better as Number instead of String)
    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    // GeoJSON format (for future map integration)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]  // [longitude, latitude]
        }
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Admin verification details
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    verifiedAt: {
        type: Date
    },

    // Reported user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    timestamps: true   // Automatically adds createdAt & updatedAt
});


// 🔥 Add index for location (for future map search)
ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
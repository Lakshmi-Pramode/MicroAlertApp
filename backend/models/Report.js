const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({

    disasterType: { 
        type: String, 
        required: true 
    },

    description: { 
        type: String 
    },

    mediaUrl: { 
        type: String   // image or video file name
    },

    latitude: { 
        type: String   // geo-tag latitude
    },

    longitude: { 
        type: String   // geo-tag longitude
    },

    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' 
    },

    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    }

});

module.exports = mongoose.model('Report', ReportSchema);
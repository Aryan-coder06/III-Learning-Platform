const mongoose = require('mongoose');

const skillShareSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['teach', 'learn'],
        required: true 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rsvps: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    maxCap: { 
        type: Number, 
        default: 50 
    },
    sessionDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('SkillShare', skillShareSchema);

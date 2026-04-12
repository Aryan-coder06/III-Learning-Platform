const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, default: uuidv4 },
    username: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String }, // Optional for social login compatibility
    role: { type: String, enum: ['student', 'mentor'], default: 'student' },
    skills: [{ type: String }],
    rating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    
    // Support for multiple files with Cloudinary metadata
    files: [{
        url: String,
        filename: String,
        cloudinary_public_id: String,
        cloudinary_secure_url: String,
        resource_type: String,
        format: String,
        bytes: Number,
        uploadedAt: { type: Date, default: Date.now },
    }],

    avatarUrl: { type: String },
    firebaseUid: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

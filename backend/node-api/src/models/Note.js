const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String },
    fileUrl: { type: String },
    isPublic: { type: Boolean, default: false },
    topic: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);

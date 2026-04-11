const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    fileUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

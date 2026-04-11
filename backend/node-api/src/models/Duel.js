const mongoose = require('mongoose');

const duelSchema = new mongoose.Schema({
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challenged: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'completed', 'declined'], default: 'pending' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    challengerScore: { type: Number, default: 0 },
    challengedScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Duel', duelSchema);

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    document_id: { type: String, required: true, unique: true },
    room_id: { type: String, required: true },
    workspace_id: { type: String, default: 'main-workspace' },
    filename: { type: String, required: true },
    file_path: { type: String, required: true }, // This will store the Cloudinary URL
    mime_type: { type: String, default: 'application/pdf' },
    uploaded_by: { type: String },
    upload_time: { type: Date, default: Date.now },
    processing_status: { type: String, enum: ['uploaded', 'processing', 'indexed', 'failed'], default: 'uploaded' },
    index_status: { type: String, enum: ['pending', 'processing', 'indexed', 'failed'], default: 'pending' },
    page_count: { type: Number, default: 0 },
    chunk_count: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

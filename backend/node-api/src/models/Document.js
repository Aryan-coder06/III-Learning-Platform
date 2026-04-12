const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    document_id: { type: String, required: true, unique: true },
    room_id: { type: String, required: true },
    workspace_id: { type: String, default: 'main-workspace' },
    filename: { type: String, required: true },
    file_path: { type: String, required: true }, // Store Cloudinary URL
    cloudinary_public_id: { type: String },
    cloudinary_secure_url: { type: String },
    resource_type: { type: String },
    format: { type: String },
    bytes: { type: Number },
    mime_type: { type: String, default: 'application/pdf' },
    uploaded_by: { type: String },
    upload_time: { type: Date, default: Date.now },
    processing_status: { type: String, enum: ['uploaded', 'processing', 'indexed', 'failed'], default: 'uploaded' },
    index_status: { type: String, enum: ['pending', 'processing', 'indexed', 'failed'], default: 'pending' },
    page_count: { type: Number, default: 0 },
    chunk_count: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
}, { timestamps: true, collection: 'documents' });

module.exports = mongoose.model('Document', documentSchema);

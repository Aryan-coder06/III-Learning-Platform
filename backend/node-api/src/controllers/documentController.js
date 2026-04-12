const {
  requireRoom,
  assertMember,
  normalizeIdentity,
} = require("../services/room.service");
const {
  syncDocumentToAiService,
  processRoomDocument,
  syncPrivateRoom,
} = require("../services/ai-room.service");
const { uploadToCloudinary } = require("../services/upload.service");
const Document = require("../models/Document");
const { v4: uuidv4 } = require("uuid");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { room_id, uploaded_by, uploaded_by_name, uploaded_by_user_id } = req.body;
    const room = await requireRoom(room_id);
    const actor = normalizeIdentity({
      userId: uploaded_by_user_id,
      name: uploaded_by_name,
      email: uploaded_by,
    });
    assertMember(room, actor.userId);

    // Metadata from req.file (populated by multer-storage-cloudinary)
    const documentId = `doc_${uuidv4().replace(/-/g, "").substring(0, 12)}`;
    const now = new Date();
    const documentData = {
      document_id: documentId,
      room_id: room_id,
      workspace_id: "main-workspace", // Match FastAPI default
      filename: req.file.originalname,
      file_path: req.file.path, // The Cloudinary secure_url
      cloudinary_public_id: req.file.filename, // The Cloudinary public_id
      cloudinary_secure_url: req.file.path,
      resource_type: "raw", // Cloudinary storage config may vary
      format: "pdf",
      bytes: req.file.size,
      mime_type: req.file.mimetype || "application/pdf",
      uploaded_by: actor.email,
      upload_time: now.toISOString(),
      processing_status: "uploaded",
      index_status: "pending",
      page_count: 0,
      chunk_count: 0,
      version: 1,
    };

    const document = new Document(documentData);
    await document.save();

    // 3. Sync metadata to AI service (non-blocking for upload success)
    let aiSync = { ok: true };
    try {
      await syncDocumentToAiService(room_id, documentData);
    } catch (syncError) {
      aiSync = {
        ok: false,
        status: syncError.status || 503,
        error: syncError.message || "AI sync failed",
      };
      console.warn(
        "AI sync failed for uploaded document %s in room %s: %s",
        documentId,
        room_id,
        aiSync.error,
      );
    }

    res.status(201).json({
      ...document.toObject(),
      ai_sync: aiSync,
      warning: aiSync.ok
        ? undefined
        : "Document uploaded, but AI indexing service is currently unavailable. Retry processing after AI service is healthy.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.processDocument = async (req, res) => {
  try {
    const { room_id, document_id } = req.params;
    const room = await requireRoom(room_id);
    assertMember(room, req.body.user_id || req.query.user_id);

    const document = await Document.findOne({ document_id: document_id });
    if (!document) {
      return res.status(404).json({ error: `Document ${document_id} not found in Node DB.` });
    }

    // Update status in MongoDB
    await Document.findOneAndUpdate(
      { document_id: document_id },
      { processing_status: "processing", index_status: "processing" },
    );

    let result;
    try {
      result = await processRoomDocument(room_id, document_id);
    } catch (error) {
      // Recovery path: if AI service does not have room/document yet, sync and retry.
      if (error.status === 404) {
        await syncPrivateRoom(room);
        const payload = document.toObject();
        if (payload.upload_time instanceof Date) {
          payload.upload_time = payload.upload_time.toISOString();
        }
        await syncDocumentToAiService(room_id, payload);
        result = await processRoomDocument(room_id, document_id);
      } else {
        throw error;
      }
    }

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const { room_id } = req.params;
    const room = await requireRoom(room_id);
    assertMember(room, req.query.user_id);

    const documents = await Document.find({ room_id: room_id }).sort({ upload_time: -1 });
    res.json(documents);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

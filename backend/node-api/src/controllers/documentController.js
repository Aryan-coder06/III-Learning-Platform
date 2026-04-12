const {
  requireRoom,
  assertMember,
  normalizeIdentity,
} = require("../services/room.service");
const {
  listRoomDocuments,
  processRoomDocument,
  uploadRoomDocument,
} = require("../services/ai-room.service");

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

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype || "application/pdf" }),
      req.file.originalname,
    );
    formData.append("uploaded_by", actor.email);

    const document = await uploadRoomDocument(room.roomId, formData);
    res.status(201).json(document);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.processDocument = async (req, res) => {
  try {
    const { room_id, document_id } = req.params;
    const room = await requireRoom(room_id);
    assertMember(room, req.body.user_id || req.query.user_id);

    const result = await processRoomDocument(room_id, document_id);
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

    const documents = await listRoomDocuments(room_id);
    res.json(documents);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const express = require("express");
const multer = require("multer");

const documentController = require("../controllers/documentController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.post("/upload", upload.single("file"), documentController.uploadDocument);
router.get("/room/:room_id", documentController.listDocuments);
router.post("/room/:room_id/process/:document_id", documentController.processDocument);

module.exports = router;

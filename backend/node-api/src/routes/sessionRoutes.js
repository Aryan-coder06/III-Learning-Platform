const express = require("express");

const sessionController = require("../controllers/sessionController");

const router = express.Router();

router.post("/start", sessionController.startSession);
router.post("/:sessionId/transcript", sessionController.appendTranscript);
router.post("/:sessionId/insights", sessionController.getLiveInsights);
router.post("/:sessionId/end", sessionController.endSession);
router.get("/", sessionController.listMySessions);
router.get("/progress", sessionController.listMyProgress);
router.post("/progress/:progressUpdateId/decision", sessionController.decideProgress);

module.exports = router;

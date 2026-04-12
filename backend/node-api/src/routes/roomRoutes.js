const express = require("express");

const roomController = require("../controllers/roomController");

const router = express.Router();

router.get("/", roomController.listRooms);
router.post("/", roomController.createPrivateRoom);
router.post("/private", roomController.createPrivateRoom);
router.post("/join-by-code", roomController.joinRoomByCode);
router.get("/:roomId", roomController.getRoom);
router.get("/:roomId/messages", roomController.getRoomMessages);
router.post("/:roomId/invites", roomController.inviteToRoom);
router.post("/:roomId/rag/query", roomController.queryRoomAssistant);

module.exports = router;

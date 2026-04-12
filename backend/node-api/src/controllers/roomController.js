const {
  createPrivateRoom,
  listRooms,
  getRoomDetail,
  joinRoomByCode,
  createInvites,
  normalizeIdentity,
  requireRoom,
  assertMember,
} = require("../services/room.service");
const { createMessage, getRoomHistory } = require("../services/chat.service");
const { queryRoomKnowledge } = require("../services/ai-room.service");

exports.createPrivateRoom = async (req, res) => {
  try {
    const room = await createPrivateRoom(req.body);
    await createMessage({
      roomId: room.roomId,
      scope: room.scope,
      senderId: "studysync-system",
      senderName: "StudySync",
      senderEmail: "system@studysync.ai",
      content: `${room.createdBy.name} created the room.`,
      messageType: "system",
    });
    const hydratedRoom = await getRoomDetail(room.roomId, room.createdBy.userId);
    res.status(201).json(hydratedRoom);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.listRooms = async (req, res) => {
  try {
    const rooms = await listRooms({
      scope: req.query.scope,
      memberId: req.query.member_id,
    });
    res.json(rooms);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await getRoomDetail(req.params.roomId, req.query.user_id);
    res.json(room);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.joinRoomByCode = async (req, res) => {
  try {
    const room = await joinRoomByCode(req.body);
    const actor = normalizeIdentity(req.body.actor || {});
    await createMessage({
      roomId: room.roomId,
      scope: room.scope,
      senderId: "studysync-system",
      senderName: "StudySync",
      senderEmail: "system@studysync.ai",
      content: `${actor.name} joined using room code ${room.roomCode}.`,
      messageType: "system",
    });
    res.json(room);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.inviteToRoom = async (req, res) => {
  try {
    const invites = await createInvites(req.params.roomId, req.body);
    const actor = normalizeIdentity(req.body.actor || {});
    await createMessage({
      roomId: req.params.roomId,
      scope: "private",
      senderId: "studysync-system",
      senderName: "StudySync",
      senderEmail: "system@studysync.ai",
      content: `${actor.name} prepared ${invites.length} invite${invites.length > 1 ? "s" : ""}.`,
      messageType: "system",
    });
    res.status(201).json({
      roomId: req.params.roomId,
      count: invites.length,
      invites,
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const room = await requireRoom(req.params.roomId);
    assertMember(room, req.query.user_id);
    const history = await getRoomHistory(req.params.roomId, Number(req.query.limit || 80));
    res.json(history);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.queryRoomAssistant = async (req, res) => {
  try {
    const actor = normalizeIdentity(req.body.actor || {});
    const room = await requireRoom(req.params.roomId);
    assertMember(room, actor.userId);
    const response = await queryRoomKnowledge(req.params.roomId, {
      query: req.body.query,
      top_k: req.body.top_k || 5,
      requested_by: actor.name,
      recent_messages: req.body.recent_messages || [],
    });

    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const { v4: uuidv4 } = require("uuid");

const Message = require("../models/Message");
const { updateRoomActivity } = require("./room.service");

function messageShape(message) {
  return {
    _id: message.messageId,
    messageId: message.messageId,
    roomId: message.roomId,
    channelId: message.scope === "public" ? message.roomId : undefined,
    scope: message.scope,
    senderId: message.senderId,
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    content: message.content,
    type: message.messageType,
    messageType: message.messageType,
    queryIntent: message.queryIntent,
    triggeredQuery: message.triggeredQuery,
    sources: message.sources || [],
    createdAt: message.createdAt,
  };
}

async function createMessage({
  roomId,
  scope = "private",
  senderId,
  senderName,
  senderEmail = "",
  content,
  messageType = "human",
  triggeredQuery = "",
  queryIntent = "",
  sources = [],
  metadata = {},
}) {
  const message = await Message.create({
    messageId: `msg_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
    roomId,
    scope,
    senderId,
    senderName,
    senderEmail,
    content: content.trim(),
    messageType,
    triggeredQuery,
    queryIntent,
    sources,
    metadata,
  });

  const activity =
    messageType === "bot"
      ? "@SYNC_BOT answered a room question."
      : messageType === "system"
        ? content
        : `${senderName} posted a new message.`;
  await updateRoomActivity(roomId, activity);

  return messageShape(message);
}

async function getRoomHistory(roomId, limit = 80) {
  const messages = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse().map(messageShape);
}

async function getRecentRoomContext(roomId, limit = 8) {
  const messages = await Message.find({
    roomId,
    messageType: { $in: ["human", "system"] },
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse().map((message) => ({
    sender_name: message.senderName,
    message_type: message.messageType,
    content: message.content,
    timestamp: message.createdAt,
  }));
}

function extractSyncBotQuery(content) {
  const mentionRegex = /@sync_bot\b/i;
  if (!mentionRegex.test(content)) {
    return null;
  }

  return content.replace(mentionRegex, "").trim();
}

module.exports = {
  createMessage,
  getRoomHistory,
  getRecentRoomContext,
  extractSyncBotQuery,
  messageShape,
};

const socketIo = require("socket.io");

const {
  DEFAULT_PUBLIC_ROOMS,
  ensurePublicRooms,
  getRoom,
  requireRoom,
  assertMember,
  normalizeIdentity,
} = require("../services/room.service");
const {
  createMessage,
  getRecentRoomContext,
  getRoomHistory,
  extractSyncBotQuery,
} = require("../services/chat.service");
const { queryRoomKnowledge } = require("../services/ai-room.service");

async function resolveRoomForSocket(roomId) {
  const existing = await getRoom(roomId);
  if (existing) {
    return existing;
  }

  const publicMatch = DEFAULT_PUBLIC_ROOMS.find((room) => room.roomId === roomId);
  if (publicMatch) {
    await ensurePublicRooms();
    return getRoom(roomId);
  }

  return null;
}

function socketError(socket, message) {
  socket.emit("message_error", { error: message });
}

async function maybeGenerateBotReply(io, room, incomingMessage) {
  const query = extractSyncBotQuery(incomingMessage.content);
  if (query === null) {
    return;
  }

  if (room.scope !== "private") {
    const botMessage = await createMessage({
      roomId: room.roomId,
      scope: room.scope,
      senderId: "sync-bot",
      senderName: "SYNC_BOT",
      senderEmail: "sync-bot@studysync.ai",
      content: "I’m enabled for private study rooms right now. Move this discussion into a private room if you want room-scoped AI help.",
      messageType: "bot",
      triggeredQuery: query,
    });
    io.to(room.roomId).emit("receive_message", botMessage);
    return;
  }

  io.to(room.roomId).emit("bot_typing", {
    roomId: room.roomId,
    senderName: "SYNC_BOT",
    query,
  });

  try {
    const recentMessages = await getRecentRoomContext(room.roomId, 10);
    const response = await queryRoomKnowledge(room.roomId, {
      query: query || "Help with the current room discussion.",
      top_k: 5,
      recent_messages: recentMessages,
      requested_by: incomingMessage.senderName,
    });

    const botMessage = await createMessage({
      roomId: room.roomId,
      scope: room.scope,
      senderId: "sync-bot",
      senderName: "SYNC_BOT",
      senderEmail: "sync-bot@studysync.ai",
      content: response.answer,
      messageType: "bot",
      triggeredQuery: query,
      queryIntent: response.intent || "",
      sources: (response.results || []).map((result) => ({
        chunkId: result.chunk_id,
        documentId: result.document_id,
        filename: result.filename,
        pageNumber: result.page_number,
        excerpt: result.excerpt || result.text || "",
      })),
      metadata: {
        retrievalRunId: response.retrieval_run_id || "",
      },
    });

    io.to(room.roomId).emit("receive_message", botMessage);
  } catch (error) {
    const botErrorMessage = await createMessage({
      roomId: room.roomId,
      scope: room.scope,
      senderId: "sync-bot",
      senderName: "SYNC_BOT",
      senderEmail: "sync-bot@studysync.ai",
      content:
        "I couldn’t answer from the room knowledge layer right now. Check that the AI service is running and that this room has indexed resources.",
      messageType: "bot",
      triggeredQuery: query,
    });
    io.to(room.roomId).emit("receive_message", botErrorMessage);
  }
}

module.exports = (server, corsOptions) => {
  const io = socketIo(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    socket.on("join_room", async (payload) => {
      try {
        const roomId = typeof payload === "string" ? payload : payload?.roomId;
        const actor = normalizeIdentity(typeof payload === "string" ? {} : payload?.actor || {});

        if (!roomId) {
          return socketError(socket, "Missing room identifier.");
        }

        const room = await resolveRoomForSocket(roomId);
        if (!room) {
          return socketError(socket, "Room does not exist.");
        }

        if (room.scope === "private") {
          assertMember(room, actor.userId);
        }

        socket.join(room.roomId);
        socket.data.identity = actor;
        socket.data.roomId = room.roomId;
        
        // Emit chat history
        socket.emit("chat_history", await getRoomHistory(room.roomId, 120));
        
        // If there's whiteboard history for this room, emit it (optional, can be done later)
      } catch (error) {
        socketError(socket, error.message || "Could not join room.");
      }
    });

    // Whiteboard events
    socket.on("whiteboard:join", (payload) => {
      const roomId = typeof payload === "string" ? payload : payload?.roomId;
      if (roomId) {
        socket.join(`whiteboard_${roomId}`);
        socket.data.whiteboardRoomId = `whiteboard_${roomId}`;
        console.log(`User joined whiteboard room: whiteboard_${roomId}`);
      }
    });

    socket.on("whiteboard:draw", (payload) => {
      const roomId = payload?.roomId || socket.data.whiteboardRoomId || socket.data.roomId;
      if (roomId) {
        const targetRoom = roomId.startsWith("whiteboard_") ? roomId : `whiteboard_${roomId}`;
        // Broadcast to everyone in the room except sender
        socket.to(targetRoom).emit("whiteboard:draw", payload.data);
      }
    });

    socket.on("whiteboard:clear", (payload) => {
      const roomId = payload?.roomId || socket.data.whiteboardRoomId || socket.data.roomId;
      if (roomId) {
        const targetRoom = roomId.startsWith("whiteboard_") ? roomId : `whiteboard_${roomId}`;
        socket.to(targetRoom).emit("whiteboard:clear");
      }
    });

    socket.on("leave_room", (payload) => {
      const roomId = typeof payload === "string" ? payload : payload?.roomId;
      if (roomId) {
        socket.leave(roomId);
        socket.leave(`whiteboard_${roomId}`);
      }
    });

    socket.on("send_message", async (payload) => {
      try {
        const roomId = payload?.roomId || payload?.channelId;
        if (!roomId || !payload?.content?.trim()) {
          return socketError(socket, "Room and content are required.");
        }

        const room = await resolveRoomForSocket(roomId);
        if (!room) {
          return socketError(socket, "Room does not exist.");
        }

        const actor = normalizeIdentity({
          ...(socket.data.identity || {}),
          userId: payload?.senderId || socket.data.identity?.userId,
          name: payload?.senderName || socket.data.identity?.name,
          email: payload?.senderEmail || socket.data.identity?.email,
        });

        if (room.scope === "private") {
          assertMember(room, actor.userId);
        }

        const humanMessage = await createMessage({
          roomId: room.roomId,
          scope: room.scope,
          senderId: actor.userId,
          senderName: actor.name,
          senderEmail: actor.email,
          content: payload.content,
          messageType: payload.messageType || "human",
        });

        io.to(room.roomId).emit("receive_message", humanMessage);
        void maybeGenerateBotReply(io, room, humanMessage);
      } catch (error) {
        socketError(socket, error.message || "Could not send message.");
      }
    });

    socket.on("disconnect", () => {});
  });

  return io;
};
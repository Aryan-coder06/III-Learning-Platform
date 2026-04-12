const { v4: uuidv4 } = require("uuid");

const Session = require("../models/Session");
const ProgressUpdate = require("../models/ProgressUpdate");
const { normalizeIdentity, getRoom, assertMember } = require("./room.service");
const { analyzeSessionTranscript, previewSessionInsights } = require("./ai-session.service");

function uniqueByUserId(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (seen.has(item.userId)) continue;
    seen.add(item.userId);
    out.push(item);
  }
  return out;
}

function mapSession(session) {
  return {
    sessionId: session.sessionId,
    roomId: session.roomId,
    roomCode: session.roomCode,
    roomTitle: session.roomTitle,
    createdBy: session.createdBy,
    participants: session.participants || [],
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    transcriptText: session.transcriptText || "",
    summary: session.summary || "",
    keyPoints: session.keyPoints || [],
    actionItems: session.actionItems || [],
    processingStatus: session.processingStatus,
    analysisError: session.analysisError || "",
    updatedAt: session.updatedAt,
  };
}

function mapProgressUpdate(update) {
  return {
    progressUpdateId: update.progressUpdateId,
    sessionId: update.sessionId,
    roomId: update.roomId,
    roomCode: update.roomCode,
    userId: update.userId,
    userName: update.userName,
    title: update.title,
    detail: update.detail,
    sourceExcerpt: update.sourceExcerpt,
    aiConfidence: update.aiConfidence,
    suggestedStatus: update.suggestedStatus,
    decisionStatus: update.decisionStatus,
    decidedBy: update.decidedBy,
    decidedAt: update.decidedAt,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt,
  };
}

async function startSession(payload) {
  const actor = normalizeIdentity(payload.actor || {});
  const roomName = `${payload.roomName || ""}`.trim();
  let roomId = payload.roomId || "";
  let roomCode = `${payload.roomCode || ""}`.trim().toUpperCase();
  let roomTitle = `${payload.roomTitle || roomName || "Virtual Session"}`.trim();
  let participants = [actor];

  if (roomId) {
    const room = await getRoom(roomId);
    if (room) {
      if (room.scope === "private") {
        assertMember(room, actor.userId);
      }
      roomCode = room.roomCode;
      roomTitle = room.title;
      participants = uniqueByUserId([
        ...room.members.map((member) => normalizeIdentity(member)),
        actor,
      ]);
    }
  }

  // If another participant opens the same session link (roomName), attach them to
  // the existing live session so transcript/progress remain shared.
  if (roomName) {
    const existingLive = await Session.findOne({
      status: "live",
      $or: [{ roomTitle }, { "metadata.roomName": roomName }],
    }).sort({ startedAt: -1 });

    if (existingLive) {
      const alreadyPresent = existingLive.participants.some(
        (participant) => participant.userId === actor.userId,
      );
      if (!alreadyPresent) {
        existingLive.participants.push({
          userId: actor.userId,
          name: actor.name,
          email: actor.email,
          joinedAt: new Date(),
          leftAt: null,
        });
        await existingLive.save();
      }
      return mapSession(existingLive);
    }
  }

  const sessionId = `sess_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
  const session = await Session.create({
    sessionId,
    roomId,
    roomCode,
    roomTitle,
    createdBy: actor,
    participants: participants.map((participant) => ({
      userId: participant.userId,
      name: participant.name,
      email: participant.email,
      joinedAt: new Date(),
    })),
    status: "live",
    processingStatus: "pending",
    metadata: {
      source: "frontend",
      roomName,
    },
  });

  return mapSession(session);
}

async function appendTranscript(sessionId, payload) {
  const actor = normalizeIdentity(payload.actor || {});
  const session = await Session.findOne({ sessionId });
  if (!session) {
    const error = new Error("Session not found.");
    error.status = 404;
    throw error;
  }

  const hasAccess = session.participants.some((participant) => participant.userId === actor.userId);
  if (!hasAccess) {
    const error = new Error("You are not part of this session.");
    error.status = 403;
    throw error;
  }

  const text = `${payload.text || ""}`.trim();
  if (!text) {
    const error = new Error("Transcript text is required.");
    error.status = 400;
    throw error;
  }

  session.transcriptSegments.push({
    speakerUserId: actor.userId,
    speakerName: actor.name,
    text,
    startedAtMs: Number.isFinite(payload.startedAtMs) ? payload.startedAtMs : null,
    endedAtMs: Number.isFinite(payload.endedAtMs) ? payload.endedAtMs : null,
    createdAt: new Date(),
  });
  session.transcriptText = [session.transcriptText, text].filter(Boolean).join("\n");
  session.metadata = {
    ...(session.metadata || {}),
    lastTranscriptAt: new Date().toISOString(),
  };

  await session.save();
  return mapSession(session);
}

async function getLiveInsights(sessionId, payload) {
  const actor = normalizeIdentity(payload.actor || {});
  const session = await Session.findOne({ sessionId });
  if (!session) {
    const error = new Error("Session not found.");
    error.status = 404;
    throw error;
  }

  const hasAccess = session.participants.some((participant) => participant.userId === actor.userId);
  if (!hasAccess) {
    const error = new Error("You are not part of this session.");
    error.status = 403;
    throw error;
  }

  const incomingTranscript = `${payload.transcriptText || ""}`.trim();
  const transcript = [session.transcriptText || "", incomingTranscript].filter(Boolean).join("\n").trim();
  if (!transcript) {
    const error = new Error("Transcript is empty. Capture or paste transcript before live insights.");
    error.status = 400;
    throw error;
  }

  const analysis = await previewSessionInsights({
    session_id: session.sessionId,
    room_id: session.roomId || "",
    room_code: session.roomCode || "",
    room_title: session.roomTitle || "Virtual Session",
    transcript_text: transcript,
    sarvam_audio_url: payload.sarvamAudioUrl || "",
    attendees: session.participants.map((participant) => ({
      user_id: participant.userId,
      name: participant.name,
      email: participant.email,
    })),
  });

  session.metadata = {
    ...(session.metadata || {}),
    liveInsights: {
      summary: analysis.summary || "",
      keyPoints: analysis.key_points || [],
      actionItems: analysis.action_items || [],
      generatedAt: new Date().toISOString(),
    },
  };
  await session.save();

  return {
    sessionId: session.sessionId,
    summary: analysis.summary || "",
    keyPoints: analysis.key_points || [],
    actionItems: analysis.action_items || [],
    transcriptSource: analysis.transcript_source || "provided_text",
  };
}

async function upsertProgressUpdates(session, actionItems = []) {
  if (!Array.isArray(actionItems) || actionItems.length === 0) {
    return [];
  }

  const writes = actionItems.map((item, index) => {
    const progressUpdateId =
      item.itemId || `prog_${session.sessionId}_${String(index + 1).padStart(2, "0")}`;

    return {
      updateOne: {
        filter: { progressUpdateId },
        update: {
          $set: {
            sessionId: session.sessionId,
            roomId: session.roomId || "",
            roomCode: session.roomCode || "",
            userId: item.ownerUserId || session.createdBy.userId,
            userName: item.ownerName || session.createdBy.name,
            title: item.text,
            detail: item.rationale || "",
            sourceExcerpt: item.sourceExcerpt || "",
            aiConfidence: typeof item.confidence === "number" ? item.confidence : 0.5,
            suggestedStatus: item.suggestedStatus || "todo",
            metadata: {
              priority: item.priority || "medium",
            },
          },
          $setOnInsert: {
            progressUpdateId,
            decisionStatus: "suggested",
          },
        },
        upsert: true,
      },
    };
  });

  if (writes.length > 0) {
    await ProgressUpdate.bulkWrite(writes);
  }

  const ids = writes.map((write) => write.updateOne.filter.progressUpdateId);
  const created = await ProgressUpdate.find({ progressUpdateId: { $in: ids } }).sort({ createdAt: -1 });
  return created.map(mapProgressUpdate);
}

async function endSessionAndAnalyze(sessionId, payload) {
  const actor = normalizeIdentity(payload.actor || {});
  const session = await Session.findOne({ sessionId });
  if (!session) {
    const error = new Error("Session not found.");
    error.status = 404;
    throw error;
  }

  const hasAccess = session.participants.some((participant) => participant.userId === actor.userId);
  if (!hasAccess) {
    const error = new Error("You are not part of this session.");
    error.status = 403;
    throw error;
  }

  if (session.status === "ended") {
    return {
      session: mapSession(session),
      progressUpdates: await listProgressUpdatesForSession(session.sessionId),
    };
  }

  const incomingTranscript = `${payload.transcriptText || ""}`.trim();
  if (incomingTranscript) {
    session.transcriptText = [session.transcriptText, incomingTranscript].filter(Boolean).join("\n");
  }

  session.status = "ended";
  session.endedAt = new Date();
  session.processingStatus = "analyzing";
  session.analysisError = "";
  await session.save();

  try {
    const analysis = await analyzeSessionTranscript({
      session_id: session.sessionId,
      room_id: session.roomId || "",
      room_code: session.roomCode || "",
      room_title: session.roomTitle || "Virtual Session",
      transcript_text: session.transcriptText || "",
      sarvam_audio_url: payload.sarvamAudioUrl || "",
      attendees: session.participants.map((participant) => ({
        user_id: participant.userId,
        name: participant.name,
        email: participant.email,
      })),
    });

    session.summary = analysis.summary || "";
    session.keyPoints = analysis.key_points || [];
    session.actionItems = (analysis.action_items || []).map((item, index) => ({
      itemId: item.item_id || `act_${String(index + 1).padStart(2, "0")}`,
      text: item.text || "",
      ownerUserId: item.owner_user_id || session.createdBy.userId,
      ownerName: item.owner_name || session.createdBy.name,
      priority: item.priority || "medium",
      suggestedStatus: item.suggested_status || "todo",
      confidence: typeof item.confidence === "number" ? item.confidence : 0.5,
      rationale: item.rationale || "",
      sourceExcerpt: item.source_excerpt || "",
    }));
    session.processingStatus = "analyzed";
    session.analysisError = "";
    await session.save();

    const progressUpdates = await upsertProgressUpdates(session, session.actionItems);

    return {
      session: mapSession(session),
      progressUpdates,
    };
  } catch (error) {
    session.processingStatus = "failed";
    session.analysisError = error.message || "Analysis failed.";
    await session.save();
    throw error;
  }
}

async function listSessionsForUser(userId, limit = 20) {
  const sessions = await Session.find({ "participants.userId": userId })
    .sort({ startedAt: -1 })
    .limit(Math.max(1, Math.min(Number(limit) || 20, 100)));

  return sessions.map(mapSession);
}

async function listProgressUpdatesForUser(userId, decisionStatus) {
  const filter = { userId };
  if (decisionStatus) {
    filter.decisionStatus = decisionStatus;
  }

  const updates = await ProgressUpdate.find(filter).sort({ createdAt: -1 }).limit(100);
  return updates.map(mapProgressUpdate);
}

async function listProgressUpdatesForSession(sessionId) {
  const updates = await ProgressUpdate.find({ sessionId }).sort({ createdAt: -1 });
  return updates.map(mapProgressUpdate);
}

async function decideProgressUpdate(progressUpdateId, payload) {
  const actor = normalizeIdentity(payload.actor || {});
  const decision = `${payload.decision || ""}`.trim().toLowerCase();
  const allowed = new Set(["accepted", "rejected", "completed"]);
  if (!allowed.has(decision)) {
    const error = new Error("Decision must be accepted, rejected, or completed.");
    error.status = 400;
    throw error;
  }

  const update = await ProgressUpdate.findOne({ progressUpdateId });
  if (!update) {
    const error = new Error("Progress update not found.");
    error.status = 404;
    throw error;
  }

  if (update.userId !== actor.userId) {
    const error = new Error("Only the assigned user can decide this update.");
    error.status = 403;
    throw error;
  }

  update.decisionStatus = decision;
  update.decidedBy = actor;
  update.decidedAt = new Date();
  if (payload.notes) {
    update.metadata = {
      ...(update.metadata || {}),
      decisionNotes: payload.notes,
    };
  }
  await update.save();

  return mapProgressUpdate(update);
}

module.exports = {
  startSession,
  appendTranscript,
  getLiveInsights,
  endSessionAndAnalyze,
  listSessionsForUser,
  listProgressUpdatesForUser,
  decideProgressUpdate,
};

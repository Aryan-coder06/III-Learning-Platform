const { env } = require("../config/env");

const TRANSIENT_STATUSES = new Set([502, 503, 504]);

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isHtmlPayload(text) {
  const normalized = `${text || ""}`.trim().toLowerCase();
  return normalized.startsWith("<!doctype") || normalized.startsWith("<html");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponse(response, fallbackMessage) {
  const text = await response.text();
  const json = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const detail = isHtmlPayload(text)
      ? response.statusText || fallbackMessage || "AI service request failed."
      : json?.detail || json?.error || text || fallbackMessage || "AI service request failed.";
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  return json;
}

async function fetchAi(path, init, fallbackMessage, retries = 3) {
  let lastError = null;
  const baseDelayMs = 1500;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${env.aiServiceUrl}${path}`, init);
      return await parseResponse(response, fallbackMessage);
    } catch (error) {
      lastError = error;
      if (!TRANSIENT_STATUSES.has(error.status) || attempt === retries) {
        throw error;
      }
      await sleep(baseDelayMs * (attempt + 1));
    }
  }

  throw lastError || new Error(fallbackMessage || "AI service request failed.");
}

async function syncPrivateRoom(room) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi("/api/rooms/private/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_id: room.roomId,
      title: room.title,
      description: room.description,
      created_by: room.createdBy.userId,
      member_ids: room.members.map((member) => member.userId),
      tags: room.tags,
    }),
  }, "Failed to sync room with the AI service.");
}

async function queryRoomKnowledge(roomId, payload) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi(`/api/rooms/${roomId}/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, "Failed to query the AI room assistant.");
}

async function listRoomDocuments(roomId) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi(`/api/rooms/${roomId}/documents`, {
    method: "GET",
  }, "Failed to load room documents.");
}

async function uploadRoomDocument(roomId, formData) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi(`/api/rooms/${roomId}/documents/upload`, {
    method: "POST",
    body: formData,
  }, "Failed to upload the room document.");
}

async function syncDocumentToAiService(roomId, documentData) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi(`/api/rooms/${roomId}/documents/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(documentData),
  }, "Failed to sync document metadata with AI service.");
}

async function processRoomDocument(roomId, documentId) {
  if (!env.aiServiceUrl) {
    const error = new Error("AI_SERVICE_URL is not configured.");
    error.status = 500;
    throw error;
  }
  return fetchAi(
    `/api/rooms/${roomId}/documents/${documentId}/process`,
    {
      method: "POST",
    },
    "Failed to start room document processing.",
  );
}

module.exports = {
  syncPrivateRoom,
  queryRoomKnowledge,
  listRoomDocuments,
  syncDocumentToAiService,
  processRoomDocument,
};

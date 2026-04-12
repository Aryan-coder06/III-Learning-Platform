const { env } = require("../config/env");

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function parseResponse(response, fallbackMessage) {
  const text = await response.text();
  const json = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const detail =
      json?.detail || json?.error || text || fallbackMessage || "AI service request failed.";
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  return json;
}

async function syncPrivateRoom(room) {
  const response = await fetch(`${env.aiServiceUrl}/api/rooms/private/sync`, {
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
  });

  return parseResponse(response, "Failed to sync room with the AI service.");
}

async function queryRoomKnowledge(roomId, payload) {
  const response = await fetch(`${env.aiServiceUrl}/api/rooms/${roomId}/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to query the AI room assistant.");
}

async function listRoomDocuments(roomId) {
  const response = await fetch(`${env.aiServiceUrl}/api/rooms/${roomId}/documents`, {
    method: "GET",
  });

  return parseResponse(response, "Failed to load room documents.");
}

async function uploadRoomDocument(roomId, formData) {
  const response = await fetch(`${env.aiServiceUrl}/api/rooms/${roomId}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response, "Failed to upload the room document.");
}

async function syncDocumentToAiService(roomId, documentData) {
  const response = await fetch(`${env.aiServiceUrl}/api/rooms/${roomId}/documents/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(documentData),
  });

  return parseResponse(response, "Failed to sync document metadata with AI service.");
}

async function processRoomDocument(roomId, documentId) {
  const response = await fetch(
    `${env.aiServiceUrl}/api/rooms/${roomId}/documents/${documentId}/process`,
    {
      method: "POST",
    },
  );

  return parseResponse(response, "Failed to start room document processing.");
}

module.exports = {
  syncPrivateRoom,
  queryRoomKnowledge,
  listRoomDocuments,
  syncDocumentToAiService,
  processRoomDocument,
};

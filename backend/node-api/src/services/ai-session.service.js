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

async function analyzeSessionTranscript(payload) {
  const response = await fetch(`${env.aiServiceUrl}/api/sessions/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to analyze session transcript.");
}

async function previewSessionInsights(payload) {
  const response = await fetch(`${env.aiServiceUrl}/api/sessions/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to generate live session insights.");
}

module.exports = {
  analyzeSessionTranscript,
  previewSessionInsights,
};

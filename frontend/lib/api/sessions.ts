import type { AppIdentity } from "@/lib/auth/identity";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "").replace(/\/api$/, "");
}

function resolveNodeApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_NODE_API_URL;
  if (envUrl) {
    return normalizeBase(envUrl);
  }
  throw new Error("NEXT_PUBLIC_NODE_API_URL is not configured");
}

export type ApiSessionActionItem = {
  itemId: string;
  text: string;
  ownerUserId: string;
  ownerName: string;
  priority: "low" | "medium" | "high";
  suggestedStatus: "todo" | "in_progress" | "done" | "needs_clarification";
  confidence: number;
  rationale: string;
  sourceExcerpt: string;
};

export type ApiSessionLiveInsights = {
  sessionId: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    item_id: string;
    text: string;
    owner_user_id: string;
    owner_name: string;
    priority: "low" | "medium" | "high";
    suggested_status: "todo" | "in_progress" | "done" | "needs_clarification";
    confidence: number;
    rationale: string;
    source_excerpt: string;
  }>;
  transcriptSource: string;
};

export type ApiSession = {
  sessionId: string;
  roomId: string;
  roomCode: string;
  roomTitle: string;
  createdBy: AppIdentity;
  participants: Array<AppIdentity & { joinedAt: string; leftAt: string | null }>;
  status: "live" | "ended";
  startedAt: string;
  endedAt: string | null;
  transcriptText: string;
  summary: string;
  keyPoints: string[];
  actionItems: ApiSessionActionItem[];
  processingStatus: "pending" | "analyzing" | "analyzed" | "failed";
  analysisError: string;
  updatedAt: string;
};

export type ApiProgressUpdate = {
  progressUpdateId: string;
  sessionId: string;
  roomId: string;
  roomCode: string;
  userId: string;
  userName: string;
  title: string;
  detail: string;
  sourceExcerpt: string;
  aiConfidence: number;
  suggestedStatus: "todo" | "in_progress" | "done" | "needs_clarification";
  decisionStatus: "suggested" | "accepted" | "rejected" | "completed";
  decidedBy: AppIdentity;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

class SessionApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SessionApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let detail = "Request failed";
  try {
    const data = (await response.json()) as { detail?: string; error?: string };
    detail = data.detail || data.error || detail;
  } catch {
    detail = response.statusText || detail;
  }
  throw new SessionApiError(detail, response.status);
}

export async function startSessionApi(payload: {
  actor: AppIdentity;
  roomId?: string;
  roomCode?: string;
  roomTitle?: string;
  roomName: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ApiSession>(response);
}

export async function appendSessionTranscriptApi(sessionId: string, payload: {
  actor: AppIdentity;
  text: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/${sessionId}/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ApiSession>(response);
}

export async function endSessionApi(sessionId: string, payload: {
  actor: AppIdentity;
  transcriptText?: string;
  sarvamAudioUrl?: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/${sessionId}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ session: ApiSession; progressUpdates: ApiProgressUpdate[] }>(response);
}

export async function getLiveSessionInsightsApi(sessionId: string, payload: {
  actor: AppIdentity;
  transcriptText?: string;
  sarvamAudioUrl?: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/${sessionId}/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ApiSessionLiveInsights>(response);
}

export async function listMySessionsApi(userId: string, limit = 20) {
  const query = new URLSearchParams({ user_id: userId, limit: String(limit) });
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<ApiSession[]>(response);
}

export async function listMyProgressUpdatesApi(userId: string, decisionStatus?: string) {
  const query = new URLSearchParams({ user_id: userId });
  if (decisionStatus) query.set("decision_status", decisionStatus);
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/progress?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<ApiProgressUpdate[]>(response);
}

export async function decideProgressUpdateApi(progressUpdateId: string, payload: {
  actor: AppIdentity;
  decision: "accepted" | "rejected" | "completed";
  notes?: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/sessions/progress/${progressUpdateId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ApiProgressUpdate>(response);
}

import type { AppIdentity } from "@/lib/auth/identity";

export type ApiRoomMember = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: string;
};

export type ApiPrivateRoom = {
  roomId: string;
  roomCode: string;
  title: string;
  description: string;
  scope: "private" | "public";
  roomType: "private" | "public";
  visibility: "private" | "public";
  topicLabel: string;
  tags: string[];
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  members: ApiRoomMember[];
  memberIds: string[];
  memberCount: number;
  viewerIsMember: boolean;
  joinLink: string;
  lastActivity: string;
  nextFocus: string;
  aiRoomReady: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiRoomDocument = {
  document_id: string;
  room_id: string;
  workspace_id: string;
  filename: string;
  file_path: string;
  mime_type: string;
  uploaded_by: string;
  upload_time: string;
  processing_status: "uploaded" | "processing" | "indexed" | "failed";
  index_status: "pending" | "processing" | "indexed" | "failed";
  page_count: number;
  chunk_count: number;
  version: number;
};

export type ApiRoomInvite = {
  inviteId: string;
  roomId: string;
  roomCode: string;
  roomTitle: string;
  invitedEmail: string;
  invitedBy: AppIdentity;
  inviteLink: string;
  inviteStatus: string;
  deliveryMode: string;
  createdAt: string;
};

export type ApiRagResult = {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number: number;
  text: string;
  excerpt?: string;
  dense_score: number;
  sparse_score: number;
  final_score: number;
};

export type ApiRagResponse = {
  room_id: string;
  query: string;
  results: ApiRagResult[];
  answer: string;
  intent?: string;
  retrieval_run_id?: string;
};

export type ApiRoomMessage = {
  _id: string;
  messageId: string;
  roomId: string;
  channelId?: string;
  scope: "private" | "public";
  senderId: string;
  senderName: string;
  senderEmail?: string;
  content: string;
  type: "human" | "bot" | "system";
  messageType: "human" | "bot" | "system";
  queryIntent?: string;
  triggeredQuery?: string;
  sources?: Array<{
    chunkId: string;
    documentId?: string;
    filename: string;
    pageNumber: number;
    excerpt: string;
  }>;
  createdAt: string;
};

export class RoomApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RoomApiError";
    this.status = status;
  }
}

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://127.0.0.1:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let detail = "Request failed";
  try {
    const data = (await response.json()) as { detail?: string; error?: string };
    if (data.detail || data.error) {
      detail = data.detail || data.error || detail;
    }
  } catch {
    detail = response.statusText || detail;
  }

  throw new RoomApiError(detail, response.status);
}

export async function createPrivateRoomApi(payload: {
  title: string;
  description: string;
  tags: string[];
  owner: AppIdentity;
  members: AppIdentity[];
}) {
  const response = await fetch(`${NODE_API_URL}/api/rooms/private`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ApiPrivateRoom>(response);
}

export async function listRoomsApi(payload: {
  scope?: "private" | "public";
  memberId?: string;
}) {
  const search = new URLSearchParams();
  if (payload.scope) {
    search.set("scope", payload.scope);
  }
  if (payload.memberId) {
    search.set("member_id", payload.memberId);
  }

  const response = await fetch(`${NODE_API_URL}/api/rooms?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<ApiPrivateRoom[]>(response);
}

export async function getRoomDetailApi(roomId: string, userId: string) {
  const search = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${NODE_API_URL}/api/rooms/${roomId}?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<ApiPrivateRoom>(response);
}

export async function joinRoomByCodeApi(payload: {
  roomCode: string;
  actor: AppIdentity;
}) {
  const response = await fetch(`${NODE_API_URL}/api/rooms/join-by-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ApiPrivateRoom>(response);
}

export async function inviteRoomMembersApi(payload: {
  roomId: string;
  actor: AppIdentity;
  emails: string[];
}) {
  const response = await fetch(`${NODE_API_URL}/api/rooms/${payload.roomId}/invites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actor: payload.actor,
      emails: payload.emails,
    }),
  });

  return parseResponse<{ roomId: string; count: number; invites: ApiRoomInvite[] }>(response);
}

export async function listRoomMessagesApi(roomId: string, userId: string, limit = 80) {
  const search = new URLSearchParams({
    user_id: userId,
    limit: String(limit),
  });

  const response = await fetch(`${NODE_API_URL}/api/rooms/${roomId}/messages?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<ApiRoomMessage[]>(response);
}

export async function listRoomDocumentsApi(roomId: string, userId: string) {
  const search = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${NODE_API_URL}/api/documents/room/${roomId}?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<ApiRoomDocument[]>(response);
}

export async function uploadRoomDocumentApi(roomId: string, file: File, actor: AppIdentity) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("room_id", roomId);
  formData.append("uploaded_by", actor.email);
  formData.append("uploaded_by_name", actor.name);
  formData.append("uploaded_by_user_id", actor.userId);

  const response = await fetch(`${NODE_API_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<ApiRoomDocument>(response);
}

export async function processRoomDocumentApi(roomId: string, documentId: string, userId: string) {
  const response = await fetch(
    `${NODE_API_URL}/api/documents/room/${roomId}/process/${documentId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    },
  );

  return parseResponse<unknown>(response);
}

export async function queryRoomKnowledgeApi(
  roomId: string,
  payload: {
    query: string;
    top_k: number;
    actor: AppIdentity;
    recent_messages?: Array<{
      sender_name: string;
      message_type: string;
      content: string;
      timestamp: string;
    }>;
  },
) {
  const response = await fetch(`${NODE_API_URL}/api/rooms/${roomId}/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ApiRagResponse>(response);
}

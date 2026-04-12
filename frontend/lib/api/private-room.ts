export type ApiPrivateRoom = {
  room_id: string;
  title: string;
  description: string;
  room_type: "private";
  visibility: "private";
  created_by: string;
  member_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
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

export type ApiRagResult = {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number: number;
  text: string;
  dense_score: number;
  sparse_score: number;
  final_score: number;
};

export type ApiRagResponse = {
  room_id: string;
  query: string;
  results: ApiRagResult[];
  answer: string;
};

export class RoomApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RoomApiError";
    this.status = status;
  }
}

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? DEFAULT_BASE_URL;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let detail = "Request failed";
  try {
    const data = (await response.json()) as { detail?: string };
    if (data.detail) {
      detail = data.detail;
    }
  } catch {
    detail = response.statusText || detail;
  }

  throw new RoomApiError(detail, response.status);
}

export async function createPrivateRoomApi(payload: {
  title: string;
  description: string;
  created_by: string;
  member_ids: string[];
  tags: string[];
}) {
  const response = await fetch(`${getBaseUrl()}/api/rooms/private`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ApiPrivateRoom>(response);
}

export async function listRoomDocumentsApi(roomId: string) {
  const response = await fetch(`${getBaseUrl()}/api/rooms/${roomId}/documents`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<ApiRoomDocument[]>(response);
}

export async function uploadRoomDocumentApi(roomId: string, file: File, uploadedBy: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploaded_by", uploadedBy);

  const response = await fetch(`${getBaseUrl()}/api/rooms/${roomId}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<ApiRoomDocument>(response);
}

export async function processRoomDocumentApi(roomId: string, documentId: string) {
  const response = await fetch(
    `${getBaseUrl()}/api/rooms/${roomId}/documents/${documentId}/process`,
    {
      method: "POST",
    },
  );

  return parseResponse<ApiRoomDocument>(response);
}

export async function queryRoomKnowledgeApi(roomId: string, payload: { query: string; top_k: number }) {
  const response = await fetch(`${getBaseUrl()}/api/rooms/${roomId}/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ApiRagResponse>(response);
}

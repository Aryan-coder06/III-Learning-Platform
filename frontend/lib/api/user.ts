export interface UserFile {
  name?: string;
  filename?: string;
  url?: string;
  file_path?: string;
  uploadedAt?: string;
  upload_time?: string;
  date?: string;
  format?: string;
  mime_type?: string;
  bytes?: number;
  size?: number;
}

export interface UserResponse {
  _id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  files: UserFile[];
  createdAt: string;
  updatedAt: string;
}

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

  throw new Error(detail);
}

export async function syncUserApi(payload: {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  firebaseUid?: string;
  role?: string;
}) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<UserResponse>(response);
}

export async function uploadUserFileApi(userId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${resolveNodeApiUrl()}/api/users/${userId}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<{ user: UserResponse; file: UserFile }>(response);
}

export async function getUserApi(userId: string) {
  const response = await fetch(`${resolveNodeApiUrl()}/api/users/${userId}`, {
    method: "GET",
  });

  return parseResponse<UserResponse>(response);
}

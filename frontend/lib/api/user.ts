import type { MockUser } from "@/lib/auth/mock-auth";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "").replace(/\/api$/, "");
}

function resolveNodeApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_NODE_API_URL;
  if (envUrl) {
    return normalizeBase(envUrl);
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  return "http://localhost:4000";
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

  return parseResponse<any>(response);
}

export async function uploadUserFileApi(userId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${resolveNodeApiUrl()}/api/users/${userId}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<{ user: any; file: any }>(response);
}

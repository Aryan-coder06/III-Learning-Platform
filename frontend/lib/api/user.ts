import type { MockUser } from "@/lib/auth/mock-auth";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL;

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
  const response = await fetch(`${NODE_API_URL}/api/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<any>(response);
}

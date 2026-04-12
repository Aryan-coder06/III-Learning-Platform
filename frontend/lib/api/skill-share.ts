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
  const detail = await response.text();
  throw new Error(detail || response.statusText || "Request failed");
}

export interface SkillSharePost {
  _id: string;
  title: string;
  description: string;
  type: "teach" | "learn";
  author: {
    _id: string;
    name: string;
    email: string;
  };
  rsvps: string[];
  maxCap: number;
  sessionDate?: string;
  createdAt: string;
}

export async function getSkillSharesApi(): Promise<SkillSharePost[]> {
  const response = await fetch(`${resolveNodeApiUrl()}/api/skill-share`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<SkillSharePost[]>(response);
}

export async function createSkillShareApi(postData: {
  title: string;
  description: string;
  type: "teach" | "learn";
  authorId: string;
  sessionDate?: Date | null;
  maxCap?: number;
}): Promise<SkillSharePost> {
  const response = await fetch(`${resolveNodeApiUrl()}/api/skill-share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });
  return parseResponse<SkillSharePost>(response);
}

export async function rsvpSkillShareApi(
  postId: string,
  userId: string,
): Promise<{ message: string; post: SkillSharePost }> {
  const response = await fetch(`${resolveNodeApiUrl()}/api/skill-share/${postId}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  return parseResponse<{ message: string; post: SkillSharePost }>(response);
}

export async function cancelRsvpSkillShareApi(
  postId: string,
  userId: string,
): Promise<{ message: string; post: SkillSharePost }> {
  const response = await fetch(`${resolveNodeApiUrl()}/api/skill-share/${postId}/cancel-rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  return parseResponse<{ message: string; post: SkillSharePost }>(response);
}

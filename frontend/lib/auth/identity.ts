import type { MockUser } from "@/lib/auth/mock-auth";

export type AppIdentity = {
  userId: string;
  name: string;
  email: string;
};

export function identityFromUser(user: MockUser | null | undefined): AppIdentity {
  const email = user?.email?.trim().toLowerCase() || "guest@studysync.local";
  const name = user?.name?.trim() || email.split("@")[0] || "Guest";
  const userId =
    email.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    userId,
    name,
    email,
  };
}

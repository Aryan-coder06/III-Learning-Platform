"use client";

import { useEffect } from "react";

import { clearMockAuthCookie, setMockAuthCookie } from "@/lib/auth/mock-auth";
import { useAuthStore } from "@/lib/auth/auth-store";

export function AuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    markHydrated();
    if (isAuthenticated) {
      setMockAuthCookie();
      return;
    }

    clearMockAuthCookie();
  }, [hydrated, isAuthenticated, markHydrated]);

  return null;
}

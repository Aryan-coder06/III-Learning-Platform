"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/lib/auth/constants";
import {
  MockUser,
  clearMockAuthCookie,
  setMockAuthCookie,
} from "@/lib/auth/mock-auth";

type AuthState = {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: MockUser | null;
  markHydrated: () => void;
  signIn: (user: MockUser) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      isAuthenticated: false,
      user: null,
      markHydrated: () => set({ hydrated: true }),
      signIn: (user) => {
        setMockAuthCookie();
        set({
          isAuthenticated: true,
          user,
        });
      },
      signOut: () => {
        clearMockAuthCookie();
        set({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WorkspaceUIState = {
  desktopCollapsed: boolean;
  mobileOpen: boolean;
  toggleDesktop: () => void;
  setDesktopCollapsed: (collapsed: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;
};

export const useWorkspaceUIStore = create<WorkspaceUIState>()(
  persist(
    (set) => ({
      desktopCollapsed: false,
      mobileOpen: false,
      toggleDesktop: () =>
        set((state) => ({
          desktopCollapsed: !state.desktopCollapsed,
        })),
      setDesktopCollapsed: (collapsed) =>
        set({
          desktopCollapsed: collapsed,
        }),
      openMobile: () =>
        set({
          mobileOpen: true,
        }),
      closeMobile: () =>
        set({
          mobileOpen: false,
        }),
    }),
    {
      name: "studysync-workspace-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        desktopCollapsed: state.desktopCollapsed,
      }),
    },
  ),
);

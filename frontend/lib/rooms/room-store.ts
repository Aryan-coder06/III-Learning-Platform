"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type PrivateRoom,
  type RoomDiscussionEntry,
  seededPrivateRooms,
} from "@/lib/mock/rooms";

const ROOM_STORAGE_KEY = "studysync-private-rooms";

export type CreatePrivateRoomInput = {
  roomId?: string;
  title: string;
  description: string;
  createdBy: string;
  memberIds: string[];
  tags: string[];
  backendReady: boolean;
};

type RoomStore = {
  rooms: PrivateRoom[];
  createRoom: (input: CreatePrivateRoomInput) => PrivateRoom;
  getRoom: (roomId: string) => PrivateRoom | undefined;
  addDiscussionEntry: (roomId: string, entry: RoomDiscussionEntry) => void;
};

function buildLocalRoomId(title: string) {
  return `room-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: seededPrivateRooms,
      createRoom: (input) => {
        const now = new Date().toISOString();
        const room: PrivateRoom = {
          roomId: input.roomId ?? buildLocalRoomId(input.title),
          title: input.title,
          description: input.description,
          roomType: "private",
          visibility: "private",
          createdBy: input.createdBy,
          memberIds: Array.from(new Set(input.memberIds)),
          tags: input.tags,
          createdAt: now,
          updatedAt: now,
          topicLabel: input.tags[0] ?? "Private workspace",
          lastActivity: input.backendReady
            ? "Backend room provisioned and ready for indexed uploads."
            : "Created locally. Backend sync will unlock live room RAG.",
          nextFocus: "Add PDFs, notes, and room prompts next.",
          backendReady: input.backendReady,
          discussion: [
            {
              id: `${input.roomId ?? "local"}-intro-discussion`,
              authorId: input.createdBy,
              authorType: "member",
              content:
                "Private room created. Use this space for focused discussion, resources, and room-scoped knowledge retrieval.",
              createdAt: "Just now",
            },
          ],
          resources: [],
          activity: [
            {
              id: `${input.roomId ?? "local"}-intro-activity`,
              label: input.backendReady
                ? "Room created and backend-connected for uploads and RAG queries."
                : "Room created locally. Create a backend-connected room to use PDF indexing.",
              createdAt: "Just now",
            },
          ],
        };

        set((state) => ({
          rooms: [room, ...state.rooms],
        }));

        return room;
      },
      getRoom: (roomId) => get().rooms.find((room) => room.roomId === roomId),
      addDiscussionEntry: (roomId, entry) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.roomId === roomId
              ? {
                  ...room,
                  discussion: [...room.discussion, entry],
                  updatedAt: new Date().toISOString(),
                  lastActivity:
                    entry.authorType === "bot"
                      ? `${entry.authorLabel ?? "SYNC_BOT"} answered in the room just now`
                      : `${entry.authorLabel ?? "Room member"} posted in the room just now`,
                }
              : room,
          ),
        })),
    }),
    {
      name: ROOM_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

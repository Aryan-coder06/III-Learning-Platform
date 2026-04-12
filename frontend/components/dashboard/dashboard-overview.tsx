"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  CalendarClock,
  FileUp,
  Video,
} from "lucide-react";

import { CreatePrivateRoomPanel } from "@/components/rooms/create-private-room-panel";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listRoomsApi, RoomApiError, type ApiPrivateRoom } from "@/lib/api/private-room";
import { identityFromUser } from "@/lib/auth/identity";
import {
  activityFeed,
  conversationPreview,
  dashboardStats,
  recentFiles,
  reminders,
  upcomingSessions,
} from "@/lib/mock/dashboard";
import { useAuthStore } from "@/lib/auth/auth-store";

import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { MessagingPreview } from "@/components/messages/messaging-preview";
import { DocumentsView } from "@/components/documents/documents-view";
import { WhiteboardPreview } from "@/components/whiteboard/whiteboard-preview";
import { SessionsSidebar } from "@/components/sessions/sessions-sidebar";
import { ActivityFeed } from "@/components/notifications/activity-feed";

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user);
  const identity = useMemo(() => identityFromUser(user), [user]);
  const [rooms, setRooms] = useState<ApiPrivateRoom[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const nextRooms = await listRoomsApi({
        scope: "private",
        memberId: identity.userId,
      });
      setRooms(nextRooms);
      setRoomError(null);
    } catch (error) {
      setRoomError(
        error instanceof RoomApiError ? error.message : "Could not load live room data.",
      );
    }
  }, [identity.userId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRooms();
    });
    const intervalId = window.setInterval(() => {
      void loadRooms();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [loadRooms]);

  const featuredRooms = rooms.slice(0, 3);
  const liveStats = [
    {
      label: "Active Rooms",
      value: rooms.length.toString().padStart(2, "0"),
      detail: "Live private collaboration spaces",
    },
    {
      label: "AI-Ready",
      value: rooms.filter((room) => room.aiRoomReady).length.toString().padStart(2, "0"),
      detail: "Rooms connected to uploads and @SYNC_BOT",
    },
    ...dashboardStats.slice(2),
  ];

  return (
    <div className="space-y-4">
      <DashboardHeader name={user?.name || "User"} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {liveStats.map((stat, index) => (
          <Card
            key={stat.label}
            className={
              index === 0
                ? "border-none bg-sidebar text-sidebar-foreground shadow-[0_20px_34px_rgba(19,19,19,0.16)]"
                : index === 1
                  ? "border-none bg-accent text-accent-foreground shadow-[0_20px_34px_rgba(255,48,0,0.14)]"
                  : "bg-card"
            }
          >
            <CardContent className="space-y-2 p-4">
              <p
                className={`text-[0.72rem] font-semibold uppercase tracking-[0.18em] ${
                  index < 2 ? "text-current/72" : "text-muted-foreground"
                }`}
              >
                {stat.label}
              </p>
              <div className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {stat.value}
              </div>
              <p className={`text-sm ${index < 2 ? "text-current/82" : "text-muted-foreground"}`}>
                {stat.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-2 border-foreground/85">
          <CardContent className="p-4">
            <WorkspaceSectionHeading
              title="Private Rooms"
              description="Focused rooms are now the primary collaboration and retrieval surface, with live room codes and AI-ready discussion."
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="dark">
                <Link href="/rooms">
                  Create Private Room
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/rooms">
                  Open Room Directory
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="grid gap-3">
                {featuredRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="rounded-[1.45rem] border border-border/70 bg-secondary/45 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">{room.topicLabel}</Badge>
                      {room.aiRoomReady && (
                        <Badge variant="default">
                          Knowledge ready
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{room.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {room.description}
                        </p>
                      </div>
                      <Button asChild variant="outline" className="shrink-0">
                        <Link href={`/rooms/${room.roomId}`}>
                          Open
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <div className="rounded-[1rem] border border-border/70 bg-white px-3 py-2">
                        {room.memberCount} members
                      </div>
                      <div className="rounded-[1rem] border border-border/70 bg-white px-3 py-2">
                        {room.nextFocus}
                      </div>
                      <div className="rounded-[1rem] border border-border/70 bg-white px-3 py-2">
                        {room.lastActivity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CreatePrivateRoomPanel compact onCreated={() => void loadRooms()} />
            </div>

            {roomError ? (
              <p className="mt-4 text-sm text-destructive">{roomError}</p>
            ) : null}
          </CardContent>
        </Card>

        <MessagingPreview />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
        <DocumentsView />

        <div className="grid gap-4">
          <WhiteboardPreview />
          <SessionsSidebar />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ActivityFeed />

        <Card>
          <CardContent className="p-4">
            <WorkspaceSectionHeading
              title="Execution Strip"
              description="The shell is ready for room-scoped uploads, retrieval runs, and next agent passes."
            />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4">
                <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <FileUp className="h-4 w-4 text-accent" />
                  Room uploads
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  PDFs persist per room and index incrementally.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4">
                <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  Hybrid retrieval
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  BM25 and dense room retrieval merge into grounded results.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4">
                <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <CalendarClock className="h-4 w-4 text-accent" />
                  Next stage
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  LangGraph can plug into the same room context without re-indexing flows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

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
import {
  activityFeed,
  conversationPreview,
  dashboardStats,
  demoUser,
  recentFiles,
  reminders,
  upcomingSessions,
} from "@/lib/mock/dashboard";
import { useRoomStore } from "@/lib/rooms/room-store";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
        {title}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function DashboardOverview() {
  const rooms = useRoomStore((state) => state.rooms);
  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="space-y-4">
      <DashboardHeader name={demoUser.name} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboardStats.map((stat, index) => (
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
            <SectionHeading
              title="Private Rooms"
              description="Focused rooms are now the primary collaboration and retrieval surface."
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
                      <Badge variant={room.backendReady ? "default" : "subtle"}>
                        {room.backendReady ? "Knowledge ready" : "Demo room"}
                      </Badge>
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
                        {room.memberIds.length} members
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

              <CreatePrivateRoomPanel compact />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-sidebar text-sidebar-foreground shadow-[0_20px_34px_rgba(19,19,19,0.16)]">
          <CardContent className="space-y-4 p-4">
            <SectionHeading
              title="Real-Time Messaging"
              description="Unread room threads and collaboration signals."
            />
            <div className="space-y-3">
              {conversationPreview.map((thread) => (
                <div
                  key={thread.room}
                  className="rounded-[1.35rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.05] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{thread.room}</p>
                    <Badge variant={thread.unread ? "accent" : "outline"}>
                      {thread.unread} unread
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-sidebar-foreground/68">
                    {thread.sender}: {thread.lastMessage}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/46">
                    {thread.time}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="p-4">
            <SectionHeading
              title="Document Sharing"
              description="Recent resources linked to rooms and ready for room-scoped indexing."
            />
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Uploaded by {file.uploader} in {file.room}
                    </p>
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {file.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_40%),white]">
            <CardContent className="p-4">
              <SectionHeading
                title="Virtual Whiteboard"
                description="Reserved collaborative canvas for diagramming and problem breakdowns."
              />
              <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-6 rounded-full ${
                        index % 5 === 0
                          ? "bg-accent"
                          : index % 3 === 0
                            ? "bg-sidebar"
                            : "bg-card"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Excalidraw-style collaboration can attach here without reworking the shell.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-2">
              <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Video className="h-4 w-4 text-accent" />
                  Upcoming sessions
                </div>
                <div className="mt-3 space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.room} className="rounded-[1rem] border border-border/70 bg-white p-3">
                      <p className="font-semibold text-foreground">{session.room}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{session.topic}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {session.datetime} · {session.participants} participants
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <BellRing className="h-4 w-4 text-accent" />
                  Reminders
                </div>
                <div className="mt-3 space-y-3">
                  {reminders.map((reminder) => (
                    <div key={reminder.title} className="rounded-[1rem] border border-border/70 bg-white p-3">
                      <p className="font-semibold text-foreground">{reminder.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{reminder.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardContent className="p-4">
            <SectionHeading
              title="Activity Feed"
              description="Recent room actions and collaboration highlights."
            />
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div key={activity} className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4 text-sm leading-6 text-muted-foreground">
                  {activity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <SectionHeading
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

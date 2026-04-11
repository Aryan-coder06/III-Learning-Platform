import Image from "next/image";
import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  FileUp,
  MessageSquareMore,
  PanelsTopLeft,
  Plus,
  UsersRound,
  Video,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  activityFeed,
  conversationPreview,
  dashboardStats,
  demoUser,
  joinedRooms,
  recentFiles,
  reminders,
  upcomingSessions,
} from "@/lib/mock/dashboard";

function PanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
            {title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <DashboardHeader name={demoUser.name} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboardStats.map((stat, index) => (
          <Card
            key={stat.label}
            className={
              index === 0
                ? "border-none bg-sidebar text-sidebar-foreground shadow-[0_22px_34px_rgba(19,19,19,0.16)]"
                : index === 1
                  ? "border-none bg-accent text-accent-foreground shadow-[0_22px_34px_rgba(255,48,0,0.14)]"
                  : "bg-card"
            }
          >
            <CardContent className="space-y-2 p-5">
              <p
                className={`text-sm font-semibold uppercase tracking-[0.18em] ${
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

      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-2 border-foreground/85">
          <CardContent className="p-6">
            <PanelHeader
              icon={UsersRound}
              title="Study Rooms"
              description="Joined rooms, topic focus, member counts, and the next live touchpoint."
            />
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <Button variant="dark">
                <Plus className="h-4 w-4" />
                Create Room
              </Button>
              <Button variant="outline">
                <ArrowUpRight className="h-4 w-4" />
                Join Room
              </Button>
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4">
                {joinedRooms.map((room) => (
                  <div
                    key={room.name}
                    className="rounded-[1.7rem] border border-border/70 bg-secondary/45 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold">{room.name}</h4>
                      <Badge variant="subtle">{room.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {room.topic}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <p>{room.members} members</p>
                      <p>{room.nextSession}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.9rem] border border-border/70 bg-sidebar p-5 text-sidebar-foreground">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
                  Focus room
                </p>
                <div className="mt-5 rounded-[1.5rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.04] p-5">
                  <p className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.06em]">
                    {joinedRooms[0]?.name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-sidebar-foreground/64">
                    {joinedRooms[0]?.topic}
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[1.35rem] border border-sidebar-foreground/10 bg-black/20 p-4 text-sm text-sidebar-foreground/72">
                    Next session: {joinedRooms[0]?.nextSession}
                  </div>
                  <div className="rounded-[1.35rem] border border-sidebar-foreground/10 bg-black/20 p-4 text-sm text-sidebar-foreground/72">
                    Live room checklist, pinned notes, and attendance summary can
                    sit here next.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-sidebar text-sidebar-foreground shadow-[0_22px_34px_rgba(19,19,19,0.16)]">
          <CardContent className="p-6">
            <PanelHeader
              icon={MessageSquareMore}
              title="Real-Time Messaging"
              description="Unread threads and recent discussion previews across joined rooms."
            />
            <div className="space-y-3">
              {conversationPreview.map((thread) => (
                <div
                  key={thread.room}
                  className="rounded-[1.5rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.05] p-4"
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

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="p-6">
            <PanelHeader
              icon={FileUp}
              title="Document Sharing"
              description="Recently shared resources tied to rooms and uploader context."
            />
            <div className="mb-5 flex justify-start">
              <Button variant="outline">Upload Resource</Button>
            </div>
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid gap-4 rounded-[1.6rem] border border-border/70 bg-secondary/45 p-4 md:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-card">
                    <Image
                      src="/theme/placeholder.svg"
                      alt="File placeholder"
                      width={44}
                      height={44}
                      className="h-11 w-auto"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
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

        <div className="grid gap-6">
          <Card className="overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_40%),white]">
            <CardContent className="p-6">
              <PanelHeader
                icon={PanelsTopLeft}
                title="Virtual Whiteboard"
                description="A reserved canvas module for collaborative drawing and visual explanation."
              />
              <div className="rounded-[1.8rem] border border-border/70 bg-secondary/45 p-4">
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-7 rounded-full ${
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
                  Collaborative drawing, cursor sync, and Excalidraw-style session mode
                  will connect here in a future stage.
                </p>
              </div>
              <Button className="mt-5" variant="dark">
                Open Whiteboard
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-[linear-gradient(180deg,rgba(242,242,242,0.65),white)]">
            <CardContent className="p-6">
              <PanelHeader
                icon={BellRing}
                title="Notifications and Reminders"
                description="Upcoming reminders and missed actions that need a quick response."
              />
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.title}
                    className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4"
                  >
                    <p className="font-semibold">{reminder.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{reminder.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border border-border/70 bg-[linear-gradient(180deg,rgba(242,242,242,0.55),white)]">
          <CardContent className="p-6">
            <PanelHeader
              icon={Video}
              title="Video Conferencing"
              description="Upcoming study sessions, room calls, and planned join actions."
            />
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.topic}
                  className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.topic}</p>
                      <p className="text-sm text-muted-foreground">{session.room}</p>
                    </div>
                    <Button variant="outline">Join Session</Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{session.datetime}</span>
                    <span>{session.participants} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.06),transparent_38%),white]">
          <CardContent className="p-6">
            <PanelHeader
              icon={CalendarClock}
              title="Activity Feed"
              description="Recent collaboration events across rooms, files, and scheduled sessions."
            />
            <div className="space-y-3">
              {activityFeed.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4 text-sm leading-7 text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

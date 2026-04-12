"use client";

import { Video, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { upcomingSessions, reminders } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

interface SessionsSidebarProps {
  className?: string;
}

export function SessionsSidebar({ className }: SessionsSidebarProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-1">
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
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Video, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listMyProgressUpdatesApi, listMySessionsApi, type ApiProgressUpdate, type ApiSession } from "@/lib/api/sessions";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import { cn } from "@/lib/utils";

interface SessionsSidebarProps {
  className?: string;
}

export function SessionsSidebar({ className }: SessionsSidebarProps) {
  const user = useAuthStore((state) => state.user);
  const identity = useMemo(() => identityFromUser(user), [user]);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [progress, setProgress] = useState<ApiProgressUpdate[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const [nextSessions, nextProgress] = await Promise.all([
          listMySessionsApi(identity.userId, 4),
          listMyProgressUpdatesApi(identity.userId, "suggested"),
        ]);
        if (!mounted) return;
        setSessions(nextSessions);
        setProgress(nextProgress);
      } catch {
        if (!mounted) return;
        setSessions([]);
        setProgress([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [identity.userId]);

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
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.sessionId} className="rounded-[1rem] border border-border/70 bg-white p-3">
                    <p className="font-semibold text-foreground">{session.roomTitle || "Session"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {session.status === "live" ? "Live now" : "Ended"}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {new Date(session.startedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {session.participants.length} participants
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-border/70 bg-white p-3 text-sm text-muted-foreground">
                  No recent sessions yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
            <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <BellRing className="h-4 w-4 text-accent" />
              Reminders
            </div>
            <div className="mt-3 space-y-3">
              {progress.length > 0 ? (
                progress.map((update) => (
                  <div key={update.progressUpdateId} className="rounded-[1rem] border border-border/70 bg-white p-3">
                    <p className="font-semibold text-foreground">{update.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      AI suggested status: {update.suggestedStatus.replace("_", " ")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-border/70 bg-white p-3 text-sm text-muted-foreground">
                  No pending progress suggestions.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { CalendarClock, Sparkles, TrendingUp, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveDate } from "@/hooks/use-live-date";

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const liveDate = useLiveDate();

  return (
    <Card className="overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_44%),rgba(242,242,242,0.55)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border/70 bg-white/80 p-6 md:p-7">
          <div className="space-y-4">
            <Badge variant="accent">Today&apos;s workspace</Badge>
            <div className="space-y-3">
              <h2 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-6xl">
                Welcome Back,
                <br />
                {name}.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                Review live rooms, unread discussion, shared resources, sessions,
                and reminders from one control center before you jump into focused
                work.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <UsersRound className="h-4 w-4 text-accent" />
                Room Pulse
              </div>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                06
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Rooms active this week</p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                Momentum
              </div>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                +18%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Weekly study cadence</p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <CalendarClock className="h-4 w-4 text-accent" />
                Next Live
              </div>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                7:30
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Greedy and graph revision</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-border/70 bg-sidebar p-6 text-sidebar-foreground">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/70">
              <Sparkles className="h-4 w-4 text-accent" />
              {liveDate}
            </div>
            <p className="mt-5 text-lg leading-8 text-sidebar-foreground/76">
              Frontend-only dashboard with protected routing and centralized mock
              data.
            </p>
            <div className="mt-6 rounded-[1.4rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.05] p-4 text-sm leading-7 text-sidebar-foreground/58">
              The shell is ready for room APIs, Socket.IO events, uploads, and live
              session hooks.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.7rem] border border-border/70 bg-white p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Files updated
              </p>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                07
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-border/70 bg-white p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Unread threads
              </p>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                19
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

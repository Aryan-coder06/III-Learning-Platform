"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveDate } from "@/hooks/use-live-date";

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const liveDate = useLiveDate();

  return (
    <Card className="border-2 border-foreground/85 bg-secondary/55">
      <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Badge variant="accent">Today&apos;s workspace</Badge>
          <div className="space-y-2">
            <h2 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-5xl">
              Welcome back, {name}.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Review live rooms, unread discussion, shared resources, sessions, and
              reminders from one control center before you jump into focused work.
            </p>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-foreground/85 bg-card px-5 py-4">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            {liveDate}
          </div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Frontend-only dashboard with protected routing and centralized mock data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

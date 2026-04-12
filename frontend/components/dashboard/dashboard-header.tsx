"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, CalendarClock, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveDate } from "@/hooks/use-live-date";

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const liveDate = useLiveDate();

  return (
    <Card className="overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_44%),rgba(242,242,242,0.55)]">
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.7rem] border border-border/70 bg-white/80 p-4 md:p-5">
          <div className="space-y-3">
            <Badge variant="accent">Today&apos;s workspace</Badge>
            <div className="space-y-2">
              <h2 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-5xl">
                Welcome Back,
                <br />
                {name}.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Private rooms, unread threads, uploads, and room-scoped knowledge
                are now the first-class control surface.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BrainCircuit className="h-4 w-4 text-accent" />
                Room RAG
              </div>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                Live
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Incremental indexing foundation</p>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                Momentum
              </div>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                +18%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Weekly study cadence</p>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
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

        <div className="grid gap-3">
          <div className="rounded-[1.7rem] border border-border/70 bg-sidebar p-5 text-sidebar-foreground">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/70">
              <Sparkles className="h-4 w-4 text-accent" />
              {liveDate}
            </div>
            <p className="mt-4 text-base leading-7 text-sidebar-foreground/76">
              FastAPI room knowledge, Mongo metadata, and future LangGraph runs can
              now plug into the dashboard shell without reshaping the UI again.
            </p>
            <div className="mt-4 rounded-[1.3rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.05] p-4 text-sm leading-6 text-sidebar-foreground/58">
              Private rooms now act as the scoped entry point for uploads, indexed
              PDFs, discussion, and future agent flows.
            </div>
            <Button asChild variant="accent" className="mt-4">
              <Link href="/rooms">
                Open private rooms
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.45rem] border border-border/70 bg-white p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Files updated
              </p>
              <p className="mt-3 font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em]">
                07
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-border/70 bg-white p-4">
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

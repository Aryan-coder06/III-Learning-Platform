import Image from "next/image";
import Link from "next/link";
import { BellRing, Files, MessageSquareShare, MonitorPlay, PanelsTopLeft, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants/site";

const quickModules = [
  { label: "Study Rooms", icon: UsersRound },
  { label: "Messaging", icon: MessageSquareShare },
  { label: "Files", icon: Files },
  { label: "Whiteboard", icon: PanelsTopLeft },
  { label: "Sessions", icon: MonitorPlay },
  { label: "Reminders", icon: BellRing },
];

export function HeroSection() {
  return (
    <section className="border-b-2 border-foreground/90">
      <div className="section-shell grid min-h-[78vh] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col justify-between border-b-2 border-foreground/90 py-14 lg:border-b-0 lg:border-r-2 lg:py-20 lg:pr-10">
          <div className="space-y-8">
            <p className="section-kicker">Stage 1 · Frontend-first build</p>
            <div className="space-y-6">
              <h1 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.88] tracking-[-0.09em] sm:text-6xl md:text-7xl lg:text-[5.4rem] xl:text-[6.6rem]">
                {siteConfig.headline}
              </h1>
              <div className="h-3 w-24 rounded-full bg-accent" />
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground md:text-2xl">
                StudySync AI gives students and teams one room for discussion, notes,
                files, whiteboards, sessions, and reminders so collaboration stays
                in sync instead of scattered.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="xl" variant="dark">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/dashboard">Explore Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 py-14 lg:py-20 lg:pl-10">
          <Card className="relative overflow-hidden border-2 border-foreground/85 bg-secondary/55">
            <div className="swiss-grid-pattern absolute inset-0 opacity-80" />
            <div className="relative grid gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="section-kicker">Live room snapshot</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.07em]">
                    DSA Sprint Room
                  </h3>
                </div>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                  Session active
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.8rem] border border-foreground/80 bg-card p-4 shadow-[0_16px_34px_rgba(19,19,19,0.08)]">
                  <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Realtime thread</span>
                    <span>04 unread</span>
                  </div>
                  <div className="space-y-3 text-sm leading-6">
                    <div className="rounded-2xl bg-secondary p-3">
                      Nisha: Uploaded the revised graph notes for today&apos;s sprint.
                    </div>
                    <div className="rounded-2xl bg-accent px-3 py-2 text-accent-foreground">
                      Aryan: Let&apos;s review questions 5 through 8 before the live call.
                    </div>
                    <div className="rounded-2xl bg-secondary p-3">
                      Kabir: Whiteboard is ready for the greedy proofs section.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.8rem] border border-foreground/80 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Next milestones
                    </p>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="rounded-2xl border border-border/70 p-3">
                        7:30 PM live revision session
                      </div>
                      <div className="rounded-2xl border border-border/70 p-3">
                        8 files synced in the room
                      </div>
                      <div className="rounded-2xl border border-border/70 p-3">
                        Shared board updated 12 min ago
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-foreground/80 bg-sidebar p-4 text-sidebar-foreground">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
                      Resource preview
                    </p>
                    <div className="mt-4 rounded-[1.4rem] border border-sidebar-foreground/12 bg-sidebar-foreground/6 p-3">
                      <Image
                        src="/theme/placeholder.svg"
                        alt="Shared document preview"
                        width={240}
                        height={160}
                        className="mx-auto h-28 w-auto opacity-90"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {quickModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.label}
                  className="rounded-[1.5rem] border border-foreground/85 bg-card px-4 py-5"
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">
                    {module.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

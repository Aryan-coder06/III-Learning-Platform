import Image from "next/image";
import { CalendarClock, Files, MessageSquareMore, PanelsTopLeft, UsersRound, Video } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";

export function PreviewSection() {
  return (
    <section id="preview" className="border-b-2 border-foreground/90 py-16 md:py-20">
      <div className="section-shell space-y-10">
        <SectionHeading
          kicker="Product preview"
          title="A dashboard built for rooms, not generic admin tables"
          description="The UI is framed as a collaborative control center with modules that map directly to the first product features."
        />

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-2 border-foreground/85 bg-card p-6">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-[1.8rem] border border-border/70 bg-secondary/45 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <UsersRound className="h-4 w-4 text-accent" />
                    Room cards
                  </div>
                  <div className="mt-4 space-y-3">
                    {["DSA Sprint", "OS Midsem Prep", "Capstone Sync"].map((room) => (
                      <div key={room} className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="font-semibold">{room}</p>
                        <p className="text-sm text-muted-foreground">
                          Members, topic focus, and session timing live here.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-border/70 bg-sidebar p-5 text-sidebar-foreground">
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
                    <MessageSquareMore className="h-4 w-4 text-accent" />
                    Chat preview
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-6">
                    <div className="rounded-2xl bg-sidebar-foreground/8 p-3">
                      “Review the DP sheet before tonight’s call.”
                    </div>
                    <div className="rounded-2xl bg-accent px-3 py-2 text-accent-foreground">
                      “Uploaded the updated outline and file links.”
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.8rem] border border-border/70 bg-card p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Files className="h-4 w-4 text-accent" />
                      Shared files
                    </div>
                    <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-secondary/50 p-4">
                      <Image
                        src="/theme/placeholder.svg"
                        alt="Document placeholder"
                        width={220}
                        height={140}
                        className="mx-auto h-24 w-auto"
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-border/70 bg-card p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <CalendarClock className="h-4 w-4 text-accent" />
                      Reminders
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="rounded-2xl border border-border/70 p-3">
                        Session starts in 45 minutes
                      </div>
                      <div className="rounded-2xl border border-border/70 p-3">
                        2 unread updates across rooms
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.8rem] border border-border/70 bg-secondary/45 p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <PanelsTopLeft className="h-4 w-4 text-accent" />
                      Whiteboard
                    </div>
                    <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card p-4">
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-6 rounded-full ${
                              index % 4 === 0
                                ? "bg-accent"
                                : index % 3 === 0
                                  ? "bg-secondary"
                                  : "bg-sidebar"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-border/70 bg-secondary/45 p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Video className="h-4 w-4 text-accent" />
                      Session module
                    </div>
                    <div className="mt-4 flex h-[176px] items-end rounded-[1.5rem] border border-border/70 bg-sidebar p-4">
                      <div className="w-full rounded-[1.2rem] bg-sidebar-foreground/8 p-4 text-sm text-sidebar-foreground/75">
                        Upcoming room call with agenda, participants, and join action
                        lives here.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

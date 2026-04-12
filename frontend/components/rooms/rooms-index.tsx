"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, LockKeyhole, UsersRound } from "lucide-react";

import { CreatePrivateRoomPanel } from "@/components/rooms/create-private-room-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberById } from "@/lib/mock/rooms";
import { useRoomStore } from "@/lib/rooms/room-store";

export function RoomsIndex() {
  const rooms = useRoomStore((state) => state.rooms);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-sidebar text-sidebar-foreground">
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Private rooms
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.length.toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Backend connected
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.filter((room) => room.backendReady).length.toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Knowledge-ready
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.filter((room) => room.backendReady).length.toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {rooms.map((room) => (
            <Card key={room.roomId} className="overflow-hidden border border-border/70">
              <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{room.roomType}</Badge>
                    <Badge variant={room.backendReady ? "default" : "subtle"}>
                      {room.backendReady ? "Room RAG ready" : "Frontend demo room"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.06em] md:text-3xl">
                      {room.title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {room.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                        Topic
                      </p>
                      <p className="mt-2 text-foreground">{room.topicLabel}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                        Members
                      </p>
                      <p className="mt-2 text-foreground">{room.memberIds.length} collaborators</p>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm text-muted-foreground">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                      Last activity
                    </p>
                    <p className="mt-2 text-foreground">{room.lastActivity}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.memberIds.slice(0, 4).map((memberId) => {
                      const member = getMemberById(memberId);
                      if (!member) {
                        return null;
                      }

                      return (
                        <span
                          key={memberId}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-2 text-sm font-semibold text-foreground"
                        >
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.68rem] uppercase ${member.accent}`}>
                            {member.name.slice(0, 1)}
                          </span>
                          {member.name}
                        </span>
                      );
                    })}
                  </div>
                    </div>

                <div className="flex flex-col gap-3 xl:w-[15rem]">
                  <div className="rounded-[1.4rem] border border-border/70 bg-sidebar px-4 py-4 text-sidebar-foreground">
                    <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/62">
                      <BrainCircuit className="h-4 w-4 text-accent" />
                      Knowledge layer
                    </div>
                    <p className="mt-3 text-sm leading-6 text-sidebar-foreground/72">
                      {room.backendReady
                        ? "Room can upload PDFs and run grounded room-scoped retrieval."
                        : "Use this room for planning now. Backend indexing unlocks on newly synced rooms."}
                    </p>
                  </div>

                  <Button asChild variant="dark" className="w-full">
                    <Link href={`/rooms/${room.roomId}`}>
                      Open room
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <CreatePrivateRoomPanel />

        <Card className="border border-border/70">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Why private first
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Private rooms keep uploads, retrieval, and discussion strictly room-bound.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-foreground">
                  <UsersRound className="h-4 w-4 text-accent" />
                  Scoped collaboration
                </span>
                <p className="mt-2">
                  Only invited members and room-linked files define the retrieval context.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-foreground">
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  Incremental indexing
                </span>
                <p className="mt-2">
                  Newly uploaded PDFs are processed independently so the room index stays fresh without global rebuilds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

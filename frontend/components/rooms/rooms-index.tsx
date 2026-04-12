"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Copy,
  LockKeyhole,
  SearchCode,
  UsersRound,
} from "lucide-react";

import {
  joinRoomByCodeApi,
  listRoomsApi,
  RoomApiError,
  type ApiPrivateRoom,
} from "@/lib/api/private-room";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import { CreatePrivateRoomPanel } from "@/components/rooms/create-private-room-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function JoinByCodePanel({
  onJoined,
}: {
  onJoined: (room: ApiPrivateRoom) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const identity = useMemo(() => identityFromUser(user), [user]);
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomCode.trim()) {
      setFeedback("Enter a room code first.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const room = await joinRoomByCodeApi({
        roomCode: roomCode.trim().toUpperCase(),
        actor: identity,
      });
      setFeedback(`Joined ${room.title}.`);
      setRoomCode("");
      onJoined(room);
    } catch (error) {
      setFeedback(
        error instanceof RoomApiError ? error.message : "Could not join that room.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border border-border/70">
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Badge variant="accent">Join by Code</Badge>
          <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
            Enter a live private room
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Use a shareable room code to join a private study space without needing a
            public link first.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleJoin}>
          <Input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            placeholder="ROOM-A7P9K"
          />
          <Button type="submit" variant="dark" className="w-full" disabled={loading}>
            <SearchCode className="h-4 w-4" />
            {loading ? "Joining room..." : "Join Room"}
          </Button>
        </form>

        {feedback ? (
          <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {feedback}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RoomsIndex() {
  const user = useAuthStore((state) => state.user);
  const identity = useMemo(() => identityFromUser(user), [user]);
  const [rooms, setRooms] = useState<ApiPrivateRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextRooms = await listRoomsApi({
        scope: "private",
        memberId: identity.userId,
      });
      setRooms(nextRooms);
    } catch (loadError) {
      setError(
        loadError instanceof RoomApiError
          ? loadError.message
          : "Could not load your private rooms.",
      );
    } finally {
      setLoading(false);
    }
  }, [identity.userId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRooms();
    });
  }, [loadRooms]);

  async function handleCopyCode(roomCode: string) {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      setError("Clipboard access failed. Copy the room code manually.");
    }
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-sidebar text-sidebar-foreground">
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Joined rooms
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.length.toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI-ready rooms
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.filter((room) => room.aiRoomReady).length.toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Collaborators
              </p>
              <p className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.08em]">
                {rooms.reduce((total, room) => total + room.memberCount, 0).toString().padStart(2, "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        {error ? (
          <Card className="border border-destructive/30 bg-[#fff1ed]">
            <CardContent className="p-4 text-sm leading-6 text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Loading private rooms...
            </CardContent>
          </Card>
        ) : rooms.length > 0 ? (
          <div className="grid gap-4">
            {rooms.map((room, roomIndex) => (
              <Card
                key={`${room.roomId || room.roomCode || "room"}-${roomIndex}`}
                className="overflow-hidden border border-border/70"
              >
                <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">{room.roomType}</Badge>
                      {room.aiRoomReady ? <Badge variant="default">AI ready</Badge> : null}
                      <Badge variant="subtle">{room.topicLabel}</Badge>
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
                      {room.tags.map((tag, tagIndex) => (
                        <span
                          key={`${room.roomId || room.roomCode}-tag-${tag}-${tagIndex}`}
                          className="rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Room code
                        </p>
                        <p className="mt-2 font-semibold text-foreground">{room.roomCode}</p>
                      </div>
                      <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Members
                        </p>
                        <p className="mt-2 font-semibold text-foreground">{room.memberCount} collaborators</p>
                      </div>
                      <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Last activity
                        </p>
                        <p className="mt-2 text-foreground">{room.lastActivity}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {room.members.slice(0, 5).map((member, memberIndex) => (
                        <span
                          key={`${room.roomId || room.roomCode}-member-${member.userId || member.email || memberIndex}`}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-2 text-sm font-semibold text-foreground"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[0.68rem] uppercase text-muted-foreground">
                            {member.name.slice(0, 1)}
                          </span>
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:w-[18rem]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-sidebar px-4 py-4 text-sidebar-foreground">
                      <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/62">
                        <BrainCircuit className="h-4 w-4 text-accent" />
                        Room assistant
                      </div>
                      <p className="mt-3 text-sm leading-6 text-sidebar-foreground/72">
                        {room.aiRoomReady
                          ? "Live chat, room-scoped uploads, and @SYNC_BOT are ready here."
                          : "Core room is live. AI sync is still catching up."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => void handleCopyCode(room.roomCode)}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Room Code
                    </Button>

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
        ) : (
          <Card>
            <CardContent className="space-y-3 p-5">
              <Badge variant="subtle">No rooms yet</Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                Create a private room or join one with a room code to start collaborating.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <CreatePrivateRoomPanel onCreated={() => void loadRooms()} />
        <JoinByCodePanel onJoined={() => void loadRooms()} />

        <Card className="border border-border/70">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Private room model
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Collaboration stays room-bound with code-based entry and grounded AI help.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-foreground">
                  <UsersRound className="h-4 w-4 text-accent" />
                  Live collaboration
                </span>
                <p className="mt-2">
                  Members join with a room code, see persisted history, and work inside a shared chat-first room.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3">
                <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-foreground">
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  Grounded tutor mode
                </span>
                <p className="mt-2">
                  Tag @SYNC_BOT in the room thread to ask grounded questions against the room’s uploaded resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

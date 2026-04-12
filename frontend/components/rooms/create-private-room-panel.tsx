"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LoaderCircle, Plus } from "lucide-react";

import { createPrivateRoomApi, RoomApiError, type ApiPrivateRoom } from "@/lib/api/private-room";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import { memberDirectory } from "@/lib/mock/rooms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CreatePrivateRoomPanelProps = {
  compact?: boolean;
  onCreated?: (room: ApiPrivateRoom) => void;
};

export function CreatePrivateRoomPanel({
  compact = false,
  onCreated,
}: CreatePrivateRoomPanelProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentIdentity = useMemo(() => identityFromUser(user), [user]);
  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  );

  function toggleMember(memberId: string) {
    setSelectedMembers((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setFeedback("Room name and description are required.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const selectedCollaborators = memberDirectory
        .filter((member) => selectedMembers.includes(member.id))
        .map((member) => ({
          userId: member.id,
          name: member.name,
          email: member.email,
        }));

      const createdRoom = await createPrivateRoomApi({
        title: title.trim(),
        description: description.trim(),
        tags,
        owner: currentIdentity,
        members: selectedCollaborators,
      });

      setFeedback(`Room created. Share ${createdRoom.roomCode} with your collaborators.`);
      setTitle("");
      setDescription("");
      setTagsInput("");
      setSelectedMembers([]);
      onCreated?.(createdRoom);
      router.push(`/rooms/${createdRoom.roomId}`);
    } catch (error) {
      setFeedback(
        error instanceof RoomApiError
          ? error.message
          : "Room creation failed. Check the backend services and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden border border-border/70">
      <CardContent className={cn("space-y-4 p-4", compact ? "md:p-4" : "md:p-5")}>
        <div className="space-y-2">
          <Badge variant="accent">Create Private Room</Badge>
          <div>
            <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.06em]">
              Spin up a live study room
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Generate a room code, invite collaborators, and unlock room-scoped chat
              plus grounded AI help.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleCreateRoom}>
          <div className="space-y-2">
            <label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Room name
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="OS Deadlock Core"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Focused private room for notes, discussions, uploads, and room-bound knowledge retrieval."
              className="min-h-[112px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tags / topic
            </label>
            <Input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="OS, Deadlocks, Midsem"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Preselect collaborators
            </label>
            <div className="flex flex-wrap gap-2">
              {memberDirectory
                .filter((member) => member.email !== currentIdentity.email)
                .map((member) => {
                  const active = selectedMembers.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold",
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border/70 bg-secondary/45 text-foreground hover:bg-secondary",
                      )}
                      onClick={() => toggleMember(member.id)}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-[0.68rem] uppercase",
                          active ? "bg-white/15" : member.accent,
                        )}
                      >
                        {member.name.slice(0, 1)}
                      </span>
                      {member.name}
                    </button>
                  );
                })}
            </div>
          </div>

          {feedback ? (
            <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
              {feedback}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" variant="dark" className="sm:flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating room
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Private Room
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() => router.push("/rooms")}
            >
              <ArrowUpRight className="h-4 w-4" />
              View Rooms
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useParams } from "next/navigation";

import { PrivateRoomPage } from "@/components/rooms/private-room-page";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function PrivateRoomRoutePage() {
  const params = useParams<{ roomId: string }>();
  const roomId = typeof params.roomId === "string" ? params.roomId : "";

  return (
    <WorkspaceShell
      title="Private Room"
      description="Room-scoped discussion, resources, activity, and the first grounded knowledge workflow."
    >
      <PrivateRoomPage roomId={roomId} />
    </WorkspaceShell>
  );
}

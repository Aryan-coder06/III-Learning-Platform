import { RoomsIndex } from "@/components/rooms/rooms-index";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function RoomsPage() {
  return (
    <WorkspaceShell
      title="Private Rooms"
      description="Create focused private rooms, invite selected members, and route uploads and retrieval through room-scoped knowledge."
    >
      <RoomsIndex />
    </WorkspaceShell>
  );
}

import { PublicRoomsView } from "@/components/rooms/public-rooms-view";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function PublicRoomsPage() {
  return (
    <WorkspaceShell
      title="Public Rooms"
      description="Join subject-specific channels, discuss with the community, and collaborate in real time."
    >
      <PublicRoomsView />
    </WorkspaceShell>
  );
}

import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function RoomsPage() {
  return (
    <WorkspaceShell
      title="Study Rooms"
      description="Dedicated room management, room creation flows, member control, and subject-based collaboration will land here."
    >
      <PagePlaceholder
        title="Study Rooms module"
        description="Room creation, invitations, membership lists, and room-specific activity streams are scaffolded for the next iteration."
      />
    </WorkspaceShell>
  );
}

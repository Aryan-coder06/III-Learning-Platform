import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function SessionsPage() {
  return (
    <WorkspaceShell
      title="Sessions"
      description="Scheduled study calls, agenda blocks, and video conferencing controls will be mounted here."
    >
      <PagePlaceholder
        title="Sessions module"
        description="LiveKit or WebRTC-backed calls, room scheduling, attendance tracking, and session notes are staged for future integration."
      />
    </WorkspaceShell>
  );
}

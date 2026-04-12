import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function WhiteboardPage() {
  return (
    <WorkspaceShell
      title="Whiteboard"
      description="Draw, sketch, and diagram your ideas on the collaborative canvas."
    >
      <WhiteboardCanvas />
    </WorkspaceShell>
  );
}

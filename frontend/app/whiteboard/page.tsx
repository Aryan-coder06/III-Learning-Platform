import { WhiteboardPreview } from "@/components/whiteboard/whiteboard-preview";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function WhiteboardPage() {
  return (
    <WorkspaceShell
      title="Whiteboard"
      description="Collaborative sketching, board state sync, and live cursor sessions will attach to this canvas route."
    >
      <WhiteboardPreview />
    </WorkspaceShell>
  );
}

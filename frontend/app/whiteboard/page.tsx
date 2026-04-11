import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function WhiteboardPage() {
  return (
    <WorkspaceShell
      title="Whiteboard"
      description="Collaborative sketching, board state sync, and live cursor sessions will attach to this canvas route."
    >
      <PagePlaceholder
        title="Whiteboard module"
        description="The canvas surface, drawing tools, and room-synced board state are intentionally reserved for the next build stage."
      />
    </WorkspaceShell>
  );
}

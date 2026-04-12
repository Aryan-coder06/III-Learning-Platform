import { DocumentsView } from "@/components/documents/documents-view";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function DocumentsPage() {
  return (
    <WorkspaceShell
      title="Documents"
      description="Uploads, room-linked resources, and file permission flows will be implemented on this route."
    >
      <DocumentsView />
    </WorkspaceShell>
  );
}

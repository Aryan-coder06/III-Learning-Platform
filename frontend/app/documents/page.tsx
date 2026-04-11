import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function DocumentsPage() {
  return (
    <WorkspaceShell
      title="Documents"
      description="Uploads, room-linked resources, and file permission flows will be implemented on this route."
    >
      <PagePlaceholder
        title="Document module"
        description="Cloudinary or local abstraction hooks, file previews, metadata, and upload flows are staged for backend integration."
      />
    </WorkspaceShell>
  );
}

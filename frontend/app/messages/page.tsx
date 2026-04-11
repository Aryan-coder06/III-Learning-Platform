import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function MessagesPage() {
  return (
    <WorkspaceShell
      title="Messages"
      description="Room-scoped realtime conversation threads, unread management, and chat composer flows are reserved here."
    >
      <PagePlaceholder
        title="Messaging module"
        description="Socket-connected threads, message history, room filters, and presence indicators will be connected in the next build stage."
      />
    </WorkspaceShell>
  );
}

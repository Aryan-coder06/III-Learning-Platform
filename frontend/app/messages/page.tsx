import { MessagingPreview } from "@/components/messages/messaging-preview";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function MessagesPage() {
  return (
    <WorkspaceShell
      title="Messages"
      description="Room-scoped realtime conversation threads, unread management, and chat composer flows are reserved here."
    >
      <MessagingPreview />
    </WorkspaceShell>
  );
}

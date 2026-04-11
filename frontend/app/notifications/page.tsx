import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function NotificationsPage() {
  return (
    <WorkspaceShell
      title="Notifications"
      description="Session reminders, unread activity summaries, and alert preferences will be expanded here."
    >
      <PagePlaceholder
        title="Notifications module"
        description="Reminder preferences, digest views, and event-triggered notifications are staged for the backend-connected iteration."
      />
    </WorkspaceShell>
  );
}

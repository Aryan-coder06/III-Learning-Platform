import { ActivityFeed } from "@/components/notifications/activity-feed";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function NotificationsPage() {
  return (
    <WorkspaceShell
      title="Notifications"
      description="Session reminders, unread activity summaries, and alert preferences will be expanded here."
    >
      <ActivityFeed />
    </WorkspaceShell>
  );
}

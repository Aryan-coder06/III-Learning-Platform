import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function SettingsPage() {
  return (
    <WorkspaceShell
      title="Settings"
      description="Profile, workspace preferences, connected services, and account-level controls will expand here."
    >
      <PagePlaceholder
        title="Settings module"
        description="User profile settings, notification preferences, room defaults, and future AI/video toggles are reserved for upcoming implementation."
      />
    </WorkspaceShell>
  );
}

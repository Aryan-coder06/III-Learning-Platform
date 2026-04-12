import { SettingsView } from "@/components/settings/settings-view";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function SettingsPage() {
  return (
    <WorkspaceShell
      title="Settings"
      description="Profile, workspace preferences, connected services, and account-level controls will expand here."
    >
      <SettingsView />
    </WorkspaceShell>
  );
}

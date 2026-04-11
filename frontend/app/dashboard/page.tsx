import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function DashboardPage() {
  return (
    <WorkspaceShell
      title="Dashboard"
      description="A collaborative student control center for rooms, threads, resources, whiteboards, sessions, reminders, and upcoming backend integrations."
    >
      <DashboardOverview />
    </WorkspaceShell>
  );
}

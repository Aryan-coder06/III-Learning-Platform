"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { useAuthStore } from "@/lib/auth/auth-store";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { SessionsSidebar } from "@/components/sessions/sessions-sidebar";
import { ActivityFeed } from "@/components/notifications/activity-feed";
import { SessionProgressWidget } from "@/components/dashboard/session-progress-widget";

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4">
      <DashboardHeader name={user?.name || "User"} />

      {/* Kanban Board */}
      <Card className="border-2 border-foreground/85">
        <CardContent className="p-4">
          <WorkspaceSectionHeading
            title="Task Board"
            description="Organize your work across columns. Drag tasks between To Do, In Progress, and Done."
          />
          <KanbanBoard />
        </CardContent>
      </Card>

      {/* Remaining sections */}
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ActivityFeed />
        <SessionsSidebar />
      </div>

      <SessionProgressWidget />
    </div>
  );
}

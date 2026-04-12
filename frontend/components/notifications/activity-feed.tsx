"use client";

import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { activityFeed } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <WorkspaceSectionHeading
          title="Activity Feed"
          description="Recent room actions and collaboration highlights."
        />
        <div className="space-y-3">
          {activityFeed.map((activity) => (
            <div key={activity} className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4 text-sm leading-6 text-muted-foreground">
              {activity}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

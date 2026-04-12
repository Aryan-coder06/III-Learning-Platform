"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { conversationPreview } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

interface MessagingPreviewProps {
  className?: string;
  isSidebar?: boolean;
}

export function MessagingPreview({ className, isSidebar = false }: MessagingPreviewProps) {
  return (
    <Card className={cn(
      "border-none bg-sidebar text-sidebar-foreground shadow-[0_20px_34px_rgba(19,19,19,0.16)]",
      className
    )}>
      <CardContent className="space-y-4 p-4">
        <WorkspaceSectionHeading
          title="Real-Time Messaging"
          description="Unread room threads and collaboration signals."
          className="text-sidebar-foreground"
        />
        <div className="space-y-3">
          {conversationPreview.map((thread) => (
            <div
              key={thread.room}
              className="rounded-[1.35rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.05] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{thread.room}</p>
                <Badge variant={thread.unread ? "accent" : "outline"}>
                  {thread.unread} unread
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-sidebar-foreground/68">
                {thread.sender}: {thread.lastMessage}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/46">
                {thread.time}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

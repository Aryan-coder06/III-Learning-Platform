"use client";

import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { cn } from "@/lib/utils";

interface WhiteboardPreviewProps {
  className?: string;
}

export function WhiteboardPreview({ className }: WhiteboardPreviewProps) {
  return (
    <Card className={cn("overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_40%),white]", className)}>
      <CardContent className="p-4">
        <WorkspaceSectionHeading
          title="Virtual Whiteboard"
          description="Reserved collaborative canvas for diagramming and problem breakdowns."
        />
        <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className={`h-6 rounded-full ${
                  index % 5 === 0
                    ? "bg-accent"
                    : index % 3 === 0
                      ? "bg-sidebar"
                      : "bg-card"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Collaborative canvas for visual learning and diagramming.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { recentFiles } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

interface DocumentsViewProps {
  className?: string;
}

export function DocumentsView({ className }: DocumentsViewProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <WorkspaceSectionHeading
          title="Document Sharing"
          description="Recent resources linked to rooms and ready for room-scoped indexing."
        />
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div
              key={file.name}
              className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Uploaded by {file.uploader} in {file.room}
                </p>
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {file.date}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

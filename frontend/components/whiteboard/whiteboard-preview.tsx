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
        <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-secondary/45 relative min-h-[432px] w-full">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src="https://miro.com/app/live-embed/uXjVGjkHXRw=/?moveToViewport=-576,-312,1152,622&embedId=937679093277" 
            frameBorder="0" 
            scrolling="no" 
            allow="fullscreen; clipboard-read; clipboard-write" 
            allowFullScreen
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
}

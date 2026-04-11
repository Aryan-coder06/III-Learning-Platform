import { ArrowRight, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-2 border-foreground/85">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-base leading-7 text-muted-foreground">
          <p>{description}</p>
          <p>
            The layout, navigation, auth guard, and route shell are ready. This page
            is intentionally staged for the next implementation round.
          </p>
          <Button variant="dark" size="lg" className="w-full sm:w-auto">
            Feature Build Queue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-secondary/45">
        <CardHeader>
          <CardTitle>Reserved integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
            <Layers3 className="mt-1 h-4 w-4 text-accent" />
            <p>Realtime room events via Socket.IO and room-scoped API contracts.</p>
          </div>
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
            <Layers3 className="mt-1 h-4 w-4 text-accent" />
            <p>Document upload abstraction with Cloudinary or local storage strategy.</p>
          </div>
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
            <Layers3 className="mt-1 h-4 w-4 text-accent" />
            <p>Whiteboard and video modules reserved for LiveKit / WebRTC integration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

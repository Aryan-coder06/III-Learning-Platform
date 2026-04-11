import { Check } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { whyStudysyncPoints } from "@/lib/mock/landing";

export function WhySection() {
  return (
    <section id="why-studysync" className="border-b-2 border-foreground/90 py-16 md:py-20">
      <div className="section-shell space-y-10">
        <SectionHeading
          kicker="Why StudySync"
          title="Less fragmentation. More shared momentum."
          description="Students do their best work when rooms, files, sessions, and updates stay in one operating context instead of spreading across disconnected tools."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {whyStudysyncPoints.map((point, index) => (
            <Card key={point} className={index === 1 ? "bg-accent text-accent-foreground" : ""}>
              <CardContent className="flex h-full gap-4 p-6">
                <div
                  className={
                    index === 1
                      ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-foreground/12"
                      : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary"
                  }
                >
                  <Check className="h-5 w-5" />
                </div>
                <p
                  className={
                    index === 1
                      ? "text-lg leading-8 text-accent-foreground/88"
                      : "text-lg leading-8 text-muted-foreground"
                  }
                >
                  {point}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

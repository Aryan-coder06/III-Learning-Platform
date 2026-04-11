import {
  BellRing,
  FileStack,
  MessageSquareShare,
  MonitorPlay,
  PanelsTopLeft,
  UsersRound,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { landingFeatures } from "@/lib/mock/landing";

const icons = [
  UsersRound,
  MessageSquareShare,
  FileStack,
  PanelsTopLeft,
  MonitorPlay,
  BellRing,
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b-2 border-foreground/90">
      <div className="section-shell grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="swiss-dots border-b-2 border-foreground/90 py-14 lg:border-b-0 lg:border-r-2 lg:py-20 lg:pr-10">
          <SectionHeading
            kicker="Capabilities"
            title="Six core systems for student collaboration"
            description="Each module is positioned for a real product flow now, with clean extension points for the future backend and AI service."
          />
        </div>

        <div className="divide-y-2 divide-foreground/90">
          {landingFeatures.map((feature, index) => {
            const Icon = icons[index];
            return (
              <article
                key={feature.title}
                className="grid gap-6 px-0 py-8 md:grid-cols-[auto_1fr] md:px-0 md:py-10 lg:pl-10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-foreground/85 bg-accent text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <h3 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.06em]">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      {feature.benefit}
                    </p>
                  </div>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

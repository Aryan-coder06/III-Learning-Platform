import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { workflowSteps } from "@/lib/mock/landing";

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-b-2 border-foreground/90 bg-secondary/45 py-16 md:py-20">
      <div className="section-shell space-y-10">
        <SectionHeading
          kicker="Collaboration workflow"
          title="How a room moves from setup to execution"
          description="The first release makes the operating model visible even before the realtime backend lands."
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-[2rem] border-2 border-foreground/85 bg-card p-6 soft-shadow"
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-[var(--font-display)] text-5xl font-bold tracking-[-0.08em] text-accent">
                  {step.step}
                </span>
                <ArrowRight className="h-5 w-5 -rotate-45 text-muted-foreground" />
              </div>
              <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

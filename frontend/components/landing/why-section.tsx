import { Plus } from "lucide-react";

import { whyStudysyncPoints } from "@/lib/mock/landing";

export function WhySection() {
  return (
    <section id="why-studysync" className="border-b-[4px] border-foreground bg-background py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="mb-4 block text-xl font-black uppercase tracking-[0.28em] text-accent">
              02. Benefit
            </span>
            <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.9] tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-8xl">
              Why
              <br />
              StudySync
            </h2>
          </div>
          <div className="flex flex-col justify-end lg:col-span-7">
            <p className="max-w-3xl text-2xl leading-tight text-foreground/70 md:text-3xl">
              One product surface for discussion, notes, files, sessions, and
              follow-through, built for students who need flow instead of clutter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border-[4px] border-foreground bg-foreground lg:grid-cols-3">
          {whyStudysyncPoints.map((point, index) => (
            <div
              key={point}
              className="group swiss-card-hover flex min-h-[280px] flex-col justify-between bg-background p-10 transition-colors duration-300 hover:bg-accent hover:text-white"
            >
              <div className="mb-10 flex items-start justify-between">
                <span className="text-xl font-black opacity-30 transition-opacity group-hover:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Plus className="h-8 w-8 text-accent transition-colors group-hover:text-white" />
              </div>
              <p className="swiss-copy-fade text-xl leading-relaxed text-foreground/70 transition-colors duration-300">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";

import { landingFeatures } from "@/lib/mock/landing";

export function FeaturesSection() {
  return (
    <section id="features" className="border-b-[4px] border-foreground bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="swiss-dots border-foreground bg-secondary p-12 lg:border-r-[4px] lg:p-24">
          <span className="mb-6 block text-xl font-black uppercase tracking-[0.28em] text-accent">
            01. System
          </span>
          <h2 className="sticky top-32 font-[var(--font-display)] text-5xl font-bold uppercase leading-none tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-8xl">
            Capabilities
            <br />
            <span className="text-foreground/20">&amp; Functions</span>
          </h2>
        </div>

        <div>
          {landingFeatures.map((feature, index) => (
            <article
              key={feature.title}
              className="group swiss-card-hover border-b-[4px] border-foreground p-10 transition-colors duration-300 last:border-b-0 hover:bg-accent hover:text-white md:p-12"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <ArrowRight className="swiss-card-arrow h-8 w-8 -rotate-45 transition-transform duration-300" />
              </div>
              <h3 className="mb-4 font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.05em]">
                {feature.title}
              </h3>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent transition-colors duration-300 group-hover:text-white/80">
                {feature.benefit}
              </p>
              <p className="swiss-copy-fade max-w-xl text-lg leading-relaxed text-foreground/80 transition-colors duration-300">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

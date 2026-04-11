import { Plus } from "lucide-react";

import { landingStats } from "@/lib/mock/landing";

export function StatsStrip() {
  return (
    <section className="border-b-[4px] border-foreground bg-black text-white">
      <div className="section-shell grid grid-cols-2 md:grid-cols-4">
        {landingStats.map((stat, index) => (
          <div
            key={stat.label}
            className={`group relative border-white/20 p-8 transition-all duration-200 hover:bg-accent md:p-12 ${
              index === 0 || index === 2 ? "border-r md:border-r" : ""
            } ${index >= 2 ? "border-t md:border-t-0" : ""}`}
          >
            <Plus className="swiss-stat-plus absolute right-4 top-4 h-4 w-4" />
            <div className="mb-2 font-[var(--font-display)] text-5xl font-bold tracking-[-0.08em] transition-transform duration-200 group-hover:scale-105 md:text-6xl lg:text-7xl">
              {stat.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.2em]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

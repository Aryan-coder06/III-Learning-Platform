import { landingStats } from "@/lib/mock/landing";

export function StatsStrip() {
  return (
    <section className="border-b-2 border-foreground/90 bg-sidebar text-sidebar-foreground">
      <div className="section-shell grid gap-px bg-sidebar-foreground/10 md:grid-cols-4">
        {landingStats.map((stat) => (
          <div key={stat.label} className="bg-sidebar px-6 py-8 md:px-8 md:py-10">
            <div className="font-[var(--font-display)] text-5xl font-bold tracking-[-0.08em] md:text-6xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/58">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

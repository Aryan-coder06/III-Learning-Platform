import Link from "next/link";
import { Plus } from "lucide-react";

const builtFor = [
  "STUDY GROUPS",
  "PROJECT TEAMS",
  "HACKATHON SQUADS",
  "ACADEMIC CLUBS",
  "LAB COLLABORATORS",
];

const dashboardMetrics = [
  { label: "Active Rooms", value: "06" },
  { label: "Unread Threads", value: "19" },
  { label: "Next Session", value: "7:30" },
  { label: "Shared Files", value: "28" },
];

export function HeroSection() {
  return (
    <section className="border-b-[4px] border-foreground bg-background">
      <div className="section-shell grid min-h-[80vh] grid-cols-1 lg:grid-cols-12">
        <div className="flex flex-col justify-between border-b-[4px] border-foreground p-6 pt-24 md:p-12 lg:col-span-8 lg:border-b-0 lg:border-r-[4px]">
          <div className="swiss-rise space-y-8">
            <h1 className="font-[var(--font-display)] text-[clamp(3.25rem,10vw,9.2rem)] font-bold uppercase leading-[0.85] tracking-[-0.1em]">
              Collaborative
              <br />
              Study Room
              <br />
              Operating
              <br />
              System
            </h1>
            <div className="h-6 w-24 bg-accent md:h-8 md:w-32" />
            <p className="max-w-2xl text-xl leading-tight text-foreground/80 md:text-2xl lg:text-3xl">
              StudySync AI brings study rooms, realtime messaging, shared files,
              whiteboards, calls, and reminders into one serious student workspace.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-4 md:mt-24 md:flex-row">
            <Link
              href="/login"
              className="inline-flex h-16 w-full items-center justify-center bg-black px-10 text-lg font-medium uppercase tracking-[0.16em] text-white hover:bg-accent md:h-20 md:w-auto md:text-xl"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-16 w-full items-center justify-center border-[3px] border-foreground bg-transparent px-10 text-lg font-medium uppercase tracking-[0.16em] text-foreground hover:bg-foreground hover:text-white md:h-20 md:w-auto md:text-xl"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:col-span-4">
          <div className="swiss-grid-pattern relative flex min-h-[460px] flex-1 overflow-hidden border-b-[4px] border-foreground bg-secondary p-8 md:p-12">
            <div className="absolute left-10 top-8 h-[74%] w-28 bg-black swiss-rise md:w-32" />
            <div
              className="absolute bottom-0 left-[44%] h-[46%] w-2 bg-black swiss-rise"
              style={{ animationDelay: "120ms" }}
            />
            <div
              className="absolute left-[49%] top-[58%] h-16 w-16 rotate-45 border-[4px] border-foreground swiss-rise md:h-20 md:w-20"
              style={{ animationDelay: "220ms" }}
            />
            <div
              className="absolute right-[11%] top-[28%] h-32 w-32 rounded-full bg-accent shadow-[0_0_0_8px_rgba(255,48,0,0.1)] swiss-float md:h-36 md:w-36"
            />
            <div className="absolute right-[28%] top-[50%] h-24 w-1 bg-accent swiss-drift" />

            <div
              className="relative mt-auto w-full border-[4px] border-foreground bg-background p-4 swiss-rise"
              style={{ animationDelay: "180ms" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                  Dashboard snapshot
                </p>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/50">
                  Real-time
                </span>
              </div>

              <div className="grid grid-cols-2 gap-px border-[4px] border-foreground bg-foreground">
                {dashboardMetrics.map((metric) => (
                  <div key={metric.label} className="bg-background p-3">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-foreground/55">
                      {metric.label}
                    </p>
                    <p className="mt-2 font-[var(--font-display)] text-3xl font-bold tracking-[-0.08em]">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
                <div className="border border-foreground/20 bg-secondary p-3">
                  Greedy session at 7:30 PM
                </div>
                <div className="border border-foreground/20 bg-secondary p-3">
                  Board synced 12 min ago
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Built For
            </p>
            <div className="flex flex-col gap-4 text-xl font-black uppercase tracking-[-0.05em] text-foreground/40">
              {builtFor.map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <Plus className="h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

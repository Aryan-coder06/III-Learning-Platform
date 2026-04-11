import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PreviewSection() {
  return (
    <section id="preview" className="border-b-[4px] border-foreground bg-background">
      <div className="section-shell px-5 py-24 md:px-8 md:py-32">
        <div className="mb-20 text-center">
          <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase tracking-[-0.08em] md:text-7xl lg:text-8xl">
            Product Preview
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/60 md:text-2xl">
            The landing page now carries the same visual grammar as the original
            Swiss theme, but the content is rebuilt around StudySync AI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border-[4px] border-foreground bg-foreground lg:grid-cols-2">
          <Link
            href="/dashboard"
            className="group swiss-card-hover flex flex-col items-center justify-between bg-background p-10 md:p-16"
          >
            <div className="mb-12 flex aspect-square w-full items-center justify-center overflow-hidden border-[4px] border-foreground bg-background transition-colors duration-300 group-hover:border-white">
              <div className="swiss-card-frame w-full max-w-[420px] bg-[#111317] p-6 text-white transition-transform duration-300">
                <div className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em]">
                  Room
                  <span className="text-accent"> intelligence</span>
                </div>
                <p className="mt-4 text-base text-white/60">
                  A dashboard surface for room health, unread activity, shared
                  documents, and upcoming study sessions.
                </p>
                <div className="mt-6 border-t border-white/15 pt-4 font-mono text-xs text-white/50">
                  {">"} syncing room activity...
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                  {["Rooms", "Messages", "Files", "Sessions", "Reminders"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/25 px-3 py-1"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <h3 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.05em] md:text-5xl">
                Room Intelligence
              </h3>
              <p className="swiss-copy-fade mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-foreground/60 md:text-2xl">
                Study rooms, files, discussion, and sessions become visible inside
                one focused workspace instead of across disconnected tabs.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-3 text-lg font-bold uppercase tracking-[0.22em] text-accent transition-colors group-hover:text-white">
              Explore
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>

          <Link
            href="/login"
            className="group swiss-card-hover flex flex-col items-center justify-between bg-accent p-10 text-white md:p-16 hover:bg-black"
          >
            <div className="mb-12 flex aspect-square w-full items-center justify-center overflow-hidden border-[4px] border-background bg-background transition-colors duration-300 group-hover:border-accent">
              <div className="swiss-card-frame relative flex h-full w-full max-w-[420px] items-center justify-center bg-[#16171b] transition-transform duration-300">
                <div className="absolute top-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/14">
                  <div className="h-10 w-10 rounded-sm bg-white/18" />
                </div>
                <div className="absolute bottom-12 left-12 right-12 rounded-[2rem] border border-white/10 bg-white/6 p-5 text-center">
                  <p className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.06em] text-white/82">
                    Your Team Room Stack
                  </p>
                  <p className="mt-3 text-base text-white/42">
                    Login, rooms, files, calls, whiteboards, and reminders.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <h3 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.05em] md:text-5xl">
                Workspace Launch
              </h3>
              <p className="swiss-copy-fade mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-white/82 md:text-2xl">
                The right-side landing visuals now preview the product dashboard
                instead of generic geometric filler.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-3 text-lg font-bold uppercase tracking-[0.22em] text-white">
              Open
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

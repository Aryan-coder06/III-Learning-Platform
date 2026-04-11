import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-accent text-accent-foreground">
      <div className="section-shell grid gap-10 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="section-kicker text-accent-foreground/80">Get started</p>
          <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.9] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
            Build your study room stack before the next sprint starts.
          </h2>
        </div>

        <div className="space-y-6">
          <p className="max-w-xl text-lg leading-8 text-accent-foreground/88 md:text-xl">
            Sign in to the mocked workspace, walk through the dashboard story, and
            use the scaffold as the foundation for realtime collaboration features.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="xl" variant="dark">
              <Link href="/login">Sign In to StudySync</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
            >
              <Link href="/dashboard">Preview Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

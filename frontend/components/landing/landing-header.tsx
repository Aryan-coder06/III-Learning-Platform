import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { landingSections } from "@/lib/constants/site";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/90 bg-background/90 backdrop-blur-sm">
      <div className="section-shell flex h-20 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:flex">
          {landingSections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/dashboard">Explore Dashboard</Link>
          </Button>
          <Button asChild variant="accent">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  inverted?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  inverted = false,
  href = "/",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="StudySync AI home"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-bold uppercase tracking-[0.2em]",
          inverted
            ? "border-sidebar-foreground/20 bg-accent text-accent-foreground"
            : "border-foreground/20 bg-accent text-accent-foreground",
        )}
      >
        SS
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            "font-[var(--font-display)] text-lg font-bold uppercase tracking-[-0.08em]",
            inverted ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          StudySync AI
        </span>
        <span
          className={cn(
            "text-[0.68rem] font-semibold uppercase tracking-[0.28em]",
            inverted ? "text-sidebar-foreground/55" : "text-muted-foreground",
          )}
        >
          Collaborative study OS
        </span>
      </span>
    </Link>
  );
}

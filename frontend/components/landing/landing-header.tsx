import Link from "next/link";
import Image from "next/image";

import { landingSections } from "@/lib/constants/site";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-[4px] border-foreground bg-background">
      <div className="section-shell flex h-24 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-5">
          <Image
            src="/Perfect_now_take_202604130037.png"
            alt="StudySync"
            width={420}
            height={90}
            priority
            className="h-14 w-auto object-contain"
          />
          <div className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] text-foreground">
            StudySync
          </div>
        </Link>

        <nav className="hidden gap-12 font-bold text-sm uppercase tracking-[0.22em] md:flex">
          {landingSections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden"
            >
              <span className="block translate-y-0 transition-transform duration-200 ease-out group-hover:-translate-y-full">
                {item.label}
              </span>
              <span className="absolute left-0 top-full block text-accent transition-transform duration-200 ease-out group-hover:-translate-y-full">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-12 items-center bg-accent px-5 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-black md:hidden"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="hidden h-14 items-center bg-accent px-10 text-sm font-medium uppercase tracking-[0.18em] text-white hover:bg-black md:inline-flex"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

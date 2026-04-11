import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const productLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rooms", label: "Study Rooms" },
  { href: "/messages", label: "Messages" },
  { href: "/documents", label: "Documents" },
];

const companyLinks = [
  { href: "/login", label: "Sign In" },
  { href: "#workflow", label: "Workflow" },
  { href: "#preview", label: "Preview" },
  { href: "#testimonials", label: "Testimonials" },
];

export function SiteFooter() {
  return (
    <footer className="bg-sidebar py-20 text-sidebar-foreground">
      <div className="section-shell space-y-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-6">
            <Logo inverted />
            <p className="max-w-xl text-base leading-7 text-sidebar-foreground/72 sm:text-lg">
              StudySync AI is the frontend-first foundation for collaborative study
              rooms, messaging, resources, whiteboards, sessions, and reminders.
            </p>
            <div className="flex max-w-md flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Email for updates"
                className="border-sidebar-foreground/15 bg-sidebar-foreground/6 text-sidebar-foreground placeholder:text-sidebar-foreground/35"
              />
              <Button variant="accent" className="sm:min-w-40">
                Stay Updated
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="section-kicker text-accent">Product</p>
            <div className="space-y-3 text-lg">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sidebar-foreground/76 hover:translate-x-1 hover:text-sidebar-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="section-kicker text-accent">Company</p>
            <div className="space-y-3 text-lg">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sidebar-foreground/76 hover:translate-x-1 hover:text-sidebar-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 text-sm leading-7 text-sidebar-foreground/55">
              <p>contact@studysync.ai</p>
              <p>github.com/studysync-ai</p>
              <p>www.studysync.ai</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-sidebar-foreground/12 pt-6 text-sm text-sidebar-foreground/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 StudySync AI. Stage 1 frontend shell.</p>
          <p>Swiss-inspired product identity, rebuilt for collaborative learning.</p>
        </div>
      </div>
    </footer>
  );
}

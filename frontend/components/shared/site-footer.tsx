import Link from "next/link";

const menuLinks = [
  { href: "#features", label: "Features" },
  { href: "#why-studysync", label: "Benefits" },
  { href: "#workflow", label: "Workflow" },
  { href: "#preview", label: "Preview" },
  { href: "/login", label: "Sign In" },
];

export function SiteFooter() {
  return (
    <footer className="bg-black pb-12 pt-24 text-white">
      <div className="section-shell px-5 md:px-8">
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="mb-8 font-[var(--font-display)] text-5xl font-bold uppercase tracking-[-0.08em]">
              StudySync AI
            </h2>
            <div className="flex max-w-xl flex-col gap-4 sm:flex-row">
              <input
                className="h-12 w-full border-b border-white bg-transparent px-0 py-2 text-lg font-medium text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                placeholder="Email Address"
              />
              <button className="h-12 bg-accent px-8 text-sm font-medium uppercase tracking-[0.18em] text-white hover:bg-white hover:text-black">
                Subscribe
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Menu
            </h4>
            <ul className="space-y-2 text-xl font-bold uppercase tracking-[-0.03em]">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-all hover:pl-2 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Connect
            </h4>
            <div className="space-y-3 text-lg font-medium text-white/75">
              <p>contact@studysync.ai</p>
              <p>github.com/studysync-ai</p>
              <p>www.studysync.ai</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-8 text-sm text-white/45 md:flex-row">
          <p>© 2026 StudySync AI. All rights reserved.</p>
          <p>Design language: International Typographic Style, rebuilt for StudySync.</p>
        </div>
      </div>
    </footer>
  );
}

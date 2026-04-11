"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Rocket, Sparkles } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { workspaceNavItems } from "@/lib/constants/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";

function matchPathname(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[19rem] shrink-0 flex-col rounded-[2rem] border border-sidebar/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),#111111] p-5 text-sidebar-foreground shadow-[0_28px_64px_rgba(19,19,19,0.22)] lg:flex">
      <div className="rounded-[1.8rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.03] p-5">
        <Logo inverted href="/dashboard" />
      </div>

      <div className="mt-5 rounded-[1.8rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.03] p-3">
        <div className="px-3 pb-3 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/38">
          Workspace Navigation
        </div>
        <div className="space-y-1">
          {workspaceNavItems.map((item) => {
            const active = matchPathname(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/48",
                  active
                    ? "bg-primary-foreground text-sidebar shadow-[0_18px_30px_rgba(255,249,239,0.12)]"
                    : "hover:bg-sidebar-foreground/7 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    active
                      ? "translate-x-0 text-sidebar/60"
                      : "translate-x-1 text-sidebar-foreground/24 group-hover:translate-x-0 group-hover:text-sidebar-foreground/52",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="rounded-[1.8rem] border border-sidebar-foreground/10 bg-white/[0.04] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                Stage 1
              </p>
              <p className="mt-2 text-sm leading-6 text-sidebar-foreground/56">
                Backend, sockets, AI, whiteboard sync, and calls are scaffolded next.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-sidebar-foreground/10 bg-white/[0.04] p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-foreground/12 bg-black text-sm font-semibold uppercase">
              {user?.name?.slice(0, 1) ?? "D"}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                {user?.name ?? "Demo User"}
              </p>
              <p className="mt-1 text-sm text-sidebar-foreground/56">
                {user?.email ?? "demo@studysync.ai"}
              </p>
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-sidebar-foreground/10 bg-black/30 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/52">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Demo workspace mode
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between rounded-[1.35rem] border border-sidebar-foreground/12 bg-sidebar-foreground/[0.04] text-sidebar-foreground hover:bg-sidebar-foreground/10"
          onClick={() => {
            signOut();
            router.push("/login");
          }}
        >
          Sign Out
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {workspaceNavItems.map((item) => {
        const active = matchPathname(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-background text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

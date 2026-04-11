"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Rocket } from "lucide-react";

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
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-80 shrink-0 flex-col rounded-[2rem] border border-sidebar/10 bg-sidebar p-6 text-sidebar-foreground shadow-[0_24px_60px_rgba(19,19,19,0.2)] lg:flex">
      <Logo inverted href="/dashboard" />

      <div className="mt-8 space-y-2">
        {workspaceNavItems.map((item) => {
          const active = matchPathname(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/58",
                active
                  ? "bg-sidebar-foreground text-sidebar shadow-[0_14px_26px_rgba(255,249,239,0.12)]"
                  : "hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4">
        <div className="rounded-[1.7rem] border border-sidebar-foreground/10 bg-sidebar-foreground/6 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                Stage 1
              </p>
              <p className="text-sm text-sidebar-foreground/58">
                Backend, sockets, AI, whiteboard sync, and calls are scaffolded next.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-sidebar-foreground/10 bg-sidebar-foreground/6 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">
            {user?.name ?? "Demo User"}
          </p>
          <p className="mt-1 text-sm text-sidebar-foreground/58">
            {user?.email ?? "demo@studysync.ai"}
          </p>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between rounded-2xl border border-sidebar-foreground/12 bg-sidebar-foreground/4 text-sidebar-foreground hover:bg-sidebar-foreground/10"
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

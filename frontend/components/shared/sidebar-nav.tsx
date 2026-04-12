"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { workspaceNavItems } from "@/lib/constants/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useWorkspaceUIStore } from "@/lib/ui/workspace-ui-store";
import { cn } from "@/lib/utils";

function matchPathname(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  collapsed,
  mobile = false,
  onNavigate,
}: {
  collapsed: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-[1.65rem] border border-sidebar-foreground/12 bg-white/[0.06] p-3">
        <Logo inverted href="/dashboard" compact={collapsed} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.65rem] border border-sidebar-foreground/12 bg-white/[0.05] p-2.5">
        {!collapsed && (
          <div className="px-3 pb-3 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/62">
            Workspace
          </div>
        )}

        <nav className="space-y-1">
          {workspaceNavItems.map((item) => {
            const active = matchPathname(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.2rem] px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em]",
                  collapsed ? "justify-center" : "justify-start",
                  active
                    ? "bg-white text-foreground shadow-[0_16px_30px_rgba(255,255,255,0.12)]"
                    : "text-sidebar-foreground/90 hover:bg-white/[0.08] hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      active
                        ? "translate-x-0 text-foreground/56"
                        : "translate-x-1 text-sidebar-foreground/40 group-hover:translate-x-0 group-hover:text-sidebar-foreground/70",
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            "rounded-[1.65rem] border border-sidebar-foreground/12 bg-white/[0.06] p-4",
            collapsed && !mobile && "px-3",
          )}
        >
          <div className={cn("flex items-start gap-3", collapsed && !mobile && "justify-center")}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Rocket className="h-4 w-4" />
            </div>
            {(!collapsed || mobile) && (
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground">
                  Room RAG
                </p>
                <p className="text-sm leading-6 text-sidebar-foreground/60">
                  Private room uploads, retrieval, and future agents connect from here next.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "rounded-[1.65rem] border border-sidebar-foreground/12 bg-white/[0.06] p-4",
            collapsed && !mobile && "px-3",
          )}
        >
          <div className={cn("flex items-center gap-3", collapsed && !mobile && "justify-center")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-foreground/12 bg-black text-sm font-semibold uppercase text-sidebar-foreground">
              {user?.name?.slice(0, 1) ?? "D"}
            </div>
            {(!collapsed || mobile) && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-sidebar-foreground">
                  {user?.name ?? "Demo User"}
                </p>
                <p className="truncate text-sm text-sidebar-foreground/58">
                  {user?.email ?? "demo@studysync.ai"}
                </p>
              </div>
            )}
          </div>

          {(!collapsed || mobile) && (
            <div className="mt-3 rounded-[1rem] border border-sidebar-foreground/10 bg-black/25 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/58">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Demo workspace mode
              </span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className={cn(
            "w-full rounded-[1.2rem] border border-sidebar-foreground/12 bg-white/[0.08] text-sidebar-foreground hover:bg-white/[0.14]",
            collapsed && !mobile ? "justify-center px-0" : "justify-between",
          )}
          onClick={() => {
            signOut();
            onNavigate?.();
            router.push("/login");
          }}
        >
          {!collapsed || mobile ? "Sign Out" : <LogOut className="h-4 w-4" />}
          {(!collapsed || mobile) && <LogOut className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function WorkspaceSidebar() {
  const mobileOpen = useWorkspaceUIStore((state) => state.mobileOpen);
  const desktopCollapsed = useWorkspaceUIStore((state) => state.desktopCollapsed);
  const closeMobile = useWorkspaceUIStore((state) => state.closeMobile);

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-foreground/10 bg-sidebar px-3 py-4 shadow-[0_28px_64px_rgba(19,19,19,0.24)] transition-[width] duration-300 lg:flex",
          desktopCollapsed ? "w-[6.5rem]" : "w-[18rem]",
        )}
      >
        <div className="w-full">
          <SidebarContent collapsed={desktopCollapsed} />
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-sidebar-foreground/10 bg-sidebar px-3 py-4 shadow-[0_28px_64px_rgba(19,19,19,0.24)] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between rounded-[1.4rem] border border-sidebar-foreground/10 bg-sidebar-foreground/[0.04] px-3 py-3 text-sidebar-foreground">
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">Navigation</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-foreground/12 bg-black/20"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent collapsed={false} mobile onNavigate={closeMobile} />
      </aside>
    </>
  );
}

export function WorkspaceSidebarToggle() {
  const desktopCollapsed = useWorkspaceUIStore((state) => state.desktopCollapsed);
  const toggleDesktop = useWorkspaceUIStore((state) => state.toggleDesktop);
  const openMobile = useWorkspaceUIStore((state) => state.openMobile);

  return (
    <>
      <button
        type="button"
        onClick={openMobile}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-white text-foreground shadow-[0_10px_22px_rgba(19,19,19,0.08)] lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={toggleDesktop}
        className="hidden h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-white text-foreground shadow-[0_10px_22px_rgba(19,19,19,0.08)] lg:flex"
        aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {desktopCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>
    </>
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
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-white text-foreground",
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

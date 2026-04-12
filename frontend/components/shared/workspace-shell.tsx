"use client";

import { Badge } from "@/components/ui/badge";
import {
  MobileNav,
  WorkspaceSidebar,
  WorkspaceSidebarToggle,
} from "@/components/shared/sidebar-nav";
import { useWorkspaceUIStore } from "@/lib/ui/workspace-ui-store";
import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function WorkspaceShell({
  title,
  description,
  children,
  actions,
}: WorkspaceShellProps) {
  const desktopCollapsed = useWorkspaceUIStore((state) => state.desktopCollapsed);

  return (
    <div className="page-noise min-h-screen bg-background">
      <WorkspaceSidebar />

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-300 lg:pr-4",
          desktopCollapsed ? "lg:pl-[6.5rem]" : "lg:pl-[18rem]",
        )}
      >
        <div className="px-3 py-3 md:px-4 md:py-4">
          <header className="mb-4 rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.94))] px-4 py-4 shadow-[0_18px_42px_rgba(19,19,19,0.05)] md:px-5">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
              <div className="flex items-start gap-3">
                <WorkspaceSidebarToggle />
                <div className="min-w-0 flex-1 rounded-[1.35rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,48,0,0.08),transparent_48%),rgba(255,255,255,0.96)] p-4 md:p-5">
                  <Badge variant="accent">Workspace</Badge>
                  <div className="mt-3 space-y-2">
                    <h1 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.08em] md:text-4xl">
                      {title}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto]">
                <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  FastAPI room RAG, Mongo-backed metadata, incremental indexing, and
                  future LangGraph orchestration attach to this shell now.
                </div>
                {actions ? (
                  <div className="flex items-stretch justify-end">{actions}</div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 lg:hidden">
              <MobileNav />
            </div>
          </header>

          <main className="space-y-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

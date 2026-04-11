import { Badge } from "@/components/ui/badge";
import { DesktopSidebar, MobileNav } from "@/components/shared/sidebar-nav";

type WorkspaceShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function WorkspaceShell({
  title,
  description,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="page-noise min-h-screen bg-background px-4 py-4 md:px-5 lg:px-6">
      <div className="mx-auto flex max-w-[1600px] gap-5">
        <DesktopSidebar />

        <div className="min-w-0 flex-1">
          <div className="rounded-[2.2rem] border border-foreground/12 bg-card/90 shadow-[0_28px_72px_rgba(19,19,19,0.08)]">
            <header className="space-y-6 border-b border-border/70 px-5 py-6 md:px-8 md:py-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <Badge variant="accent">Workspace</Badge>
                  <div className="space-y-2">
                    <h1 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-5xl">
                      {title}
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-border/70 bg-secondary/50 px-5 py-4 text-sm leading-6 text-muted-foreground xl:max-w-xs">
                  Node + Express, Socket.IO, MongoDB, FastAPI, video sessions, and
                  collaborative canvas are scaffolded for the next stages.
                </div>
              </div>

              <MobileNav />
            </header>

            <main className="space-y-6 px-5 py-6 md:px-8 md:py-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

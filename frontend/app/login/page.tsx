import { ArrowRight, CheckCircle2, Layers3, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/shared/login-form";
import { Logo } from "@/components/shared/logo";

const highlights = [
  "Room-based collaboration for study groups and project teams.",
  "Mock auth + protected routes ready for backend hookup.",
  "Dashboard architecture aligned for sockets, documents, sessions, and AI later.",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next || "/dashboard";

  return (
    <div className="page-noise min-h-screen bg-background">
      <div className="section-shell grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <Logo />
          <div className="space-y-5">
            <p className="section-kicker">Authentication flow</p>
            <h1 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.9] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
              Sign in to the collaborative control center.
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              StudySync now uses Firebase Authentication for secure, room-scoped 
              collaboration. Sign in with your Google account to start creating 
              private study rooms.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.8rem] border-2 border-foreground/85 bg-card p-5">
              <Layers3 className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Split-screen continuity
              </p>
            </div>
            <div className="rounded-[1.8rem] border-2 border-foreground/85 bg-card p-5">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Middleware protected routes
              </p>
            </div>
            <div className="rounded-[1.8rem] border-2 border-foreground/85 bg-card p-5">
              <ArrowRight className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Redirect to dashboard
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-foreground/85 bg-secondary/45 p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              What this stage already proves
            </p>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3 text-base leading-7 text-muted-foreground">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}

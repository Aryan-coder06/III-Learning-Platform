import { Suspense } from "react";
import { SessionsMeeting } from "@/components/sessions/sessions-meeting";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

export default function SessionsPage() {
  return (
    <WorkspaceShell
      title="Sessions"
      description="Start a video study session with your partner. Create or join a room and collaborate in real time."
    >
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading sessions…
          </div>
        }
      >
        <SessionsMeeting />
      </Suspense>
    </WorkspaceShell>
  );
}

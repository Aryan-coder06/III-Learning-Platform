"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

import {
  decideProgressUpdateApi,
  listMyProgressUpdatesApi,
  type ApiProgressUpdate,
} from "@/lib/api/sessions";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SessionProgressWidget() {
  const user = useAuthStore((state) => state.user);
  const actor = useMemo(() => identityFromUser(user), [user]);
  const [updates, setUpdates] = useState<ApiProgressUpdate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listMyProgressUpdatesApi(actor.userId, "suggested");
      setUpdates(list);
    } catch {
      setUpdates([]);
    }
  }, [actor.userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function decide(progressUpdateId: string, decision: "accepted" | "rejected") {
    setBusyId(progressUpdateId);
    try {
      await decideProgressUpdateApi(progressUpdateId, {
        actor,
        decision,
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="border border-border/70">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Session Progress Signals
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-suggested updates extracted from virtual sessions.
            </p>
          </div>
          <Badge variant="subtle">{updates.length} pending</Badge>
        </div>

        {updates.length > 0 ? (
          <div className="space-y-3">
            {updates.slice(0, 5).map((update) => (
              <div key={update.progressUpdateId} className="rounded-xl border border-border/70 bg-secondary/45 p-3">
                <p className="font-semibold text-foreground">{update.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suggested: {update.suggestedStatus.replace("_", " ")} · confidence{" "}
                  {(update.aiConfidence * 100).toFixed(0)}%
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    disabled={busyId === update.progressUpdateId}
                    onClick={() => void decide(update.progressUpdateId, "accepted")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busyId === update.progressUpdateId}
                    onClick={() => void decide(update.progressUpdateId, "rejected")}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-secondary/45 p-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              No pending session-based progress updates right now.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Video,
  VideoOff,
  Users,
  Link2,
  Sparkles,
  Radio,
  MonitorPlay,
  LoaderCircle,
  Mic,
  MicOff,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useJitsi } from "@/hooks/use-jitsi";
import { useLiveTranscript } from "@/hooks/use-live-transcript";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import {
  appendSessionTranscriptApi,
  endSessionApi,
  getLiveSessionInsightsApi,
  startSessionApi,
  type ApiSessionLiveInsights,
  type ApiProgressUpdate,
  type ApiSession,
} from "@/lib/api/sessions";
import { cn } from "@/lib/utils";

function generateRoomSlug(): string {
  const adjectives = [
    "cosmic",
    "stellar",
    "quantum",
    "radiant",
    "vibrant",
    "lucid",
    "crystal",
    "nova",
    "zenith",
    "prism",
  ];
  const nouns = [
    "nexus",
    "orbit",
    "pulse",
    "wave",
    "spark",
    "flux",
    "core",
    "beam",
    "arc",
    "link",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}

function generateMeetingKey(): string {
  const raw =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  return `mk_${raw.slice(0, 18)}`;
}

export function SessionsMeeting() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const actor = identityFromUser(user);
  const { startMeeting, endMeeting, loading, error, inCall } = useJitsi();

  const [roomName, setRoomName] = useState(
    () => searchParams.get("room") || generateRoomSlug(),
  );
  const [meetingKey, setMeetingKey] = useState(
    () => searchParams.get("mk") || searchParams.get("room") || generateMeetingKey(),
  );
  const [displayName, setDisplayName] = useState(
    () => user?.name || "Study Buddy",
  );
  const [copied, setCopied] = useState(false);
  const [autoJoining, setAutoJoining] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [activeSession, setActiveSession] = useState<ApiSession | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [sarvamAudioUrl, setSarvamAudioUrl] = useState("");
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<ApiSession | null>(null);
  const [lastProgressUpdates, setLastProgressUpdates] = useState<ApiProgressUpdate[]>([]);
  const [liveInsights, setLiveInsights] = useState<ApiSessionLiveInsights | null>(null);
  const [insightBusy, setInsightBusy] = useState(false);
  const [uploadingChunk, setUploadingChunk] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const handleTranscriptChunk = useCallback(
    async (chunk: { text: string; startedAtMs: number | null; endedAtMs: number | null }) => {
      setTranscriptDraft((current) => [current, chunk.text].filter(Boolean).join("\n"));
      if (!activeSession) {
        return;
      }
      setUploadingChunk(true);
      try {
        await appendSessionTranscriptApi(activeSession.sessionId, {
          actor,
          text: chunk.text,
        });
      } catch (err) {
        setSessionError(
          err instanceof Error ? err.message : "Failed to stream transcript chunk.",
        );
      } finally {
        setUploadingChunk(false);
      }
    },
    [activeSession, actor],
  );

  const {
    supported: liveTranscriptSupported,
    running: liveTranscriptRunning,
    error: liveTranscriptError,
    start: startLiveTranscript,
    stop: stopLiveTranscript,
  } = useLiveTranscript(handleTranscriptChunk);

  // Auto-join when coming from a shared link with ?room=
  const roomParam = searchParams.get("room");
  const meetingParam = searchParams.get("mk") || searchParams.get("room");
  useEffect(() => {
    if (meetingParam && roomParam && jitsiContainerRef.current && !inCall && !autoJoining) {
      setAutoJoining(true);
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        handleJoinSession();
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingParam, roomParam]);

  const handleJoinSession = useCallback(async () => {
    if (!jitsiContainerRef.current) return;

    setSessionBusy(true);
    setSessionError(null);
    try {
      const session = await startSessionApi({
        actor,
        roomName: meetingKey,
        roomTitle: roomName,
      });
      setActiveSession(session);
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : "Could not start session in backend.",
      );
      setSessionBusy(false);
      return;
    }

    // Clear existing children in the container
    jitsiContainerRef.current.innerHTML = "";

    startMeeting({
      roomName: meetingKey,
      displayName,
      parentNode: jitsiContainerRef.current,
      onReadyToClose: () => {
        endMeeting();
        setAutoJoining(false);
      },
    });
    setSessionBusy(false);
  }, [meetingKey, roomName, displayName, startMeeting, endMeeting, actor]);

  const handleLeaveSession = useCallback(async () => {
    setSessionBusy(true);
    setSessionError(null);
    try {
      if (liveTranscriptRunning) {
        stopLiveTranscript();
      }
      if (activeSession) {
        const result = await endSessionApi(activeSession.sessionId, {
          actor,
          transcriptText: transcriptDraft,
          sarvamAudioUrl,
        });
        setLastSummary(result.session);
        setLastProgressUpdates(result.progressUpdates);
        setActiveSession(null);
        setTranscriptDraft("");
      }
      endMeeting();
      setAutoJoining(false);
      // Remove the ?room= param on leave
      router.replace("/sessions");
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : "Could not finalize session summary.",
      );
    } finally {
      setSessionBusy(false);
    }
  }, [endMeeting, router, activeSession, actor, transcriptDraft, sarvamAudioUrl, liveTranscriptRunning, stopLiveTranscript]);

  async function handleLiveInsights() {
    if (!activeSession) return;
    setInsightBusy(true);
    setSessionError(null);
    try {
      const insights = await getLiveSessionInsightsApi(activeSession.sessionId, {
        actor,
        transcriptText: transcriptDraft,
        sarvamAudioUrl,
      });
      setLiveInsights(insights);
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : "Failed to generate live session insights.",
      );
    } finally {
      setInsightBusy(false);
    }
  }

  // Compute shareUrl client-side only to avoid hydration mismatch
  useEffect(() => {
    setShareUrl(
      `${window.location.origin}/sessions?room=${encodeURIComponent(roomName)}&mk=${encodeURIComponent(meetingKey)}`,
    );
  }, [roomName, meetingKey]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div className="space-y-5">
      {/* Lobby / Controls bar — always visible */}
      {!inCall && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Main join card */}
          <Card
            className="relative overflow-hidden border-2 border-foreground/85"
            id="session-join-card"
          >
            {/* Decorative corner accent */}
            <div className="absolute right-0 top-0 h-28 w-28 bg-[linear-gradient(225deg,var(--accent)_0%,transparent_70%)] opacity-20" />
            <div className="absolute bottom-0 left-0 h-20 w-20 bg-[linear-gradient(45deg,var(--accent)_0%,transparent_70%)] opacity-10" />

            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Start a Study Session</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create or join a video call with your study partner
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
              <div className="space-y-3">
                <label
                  htmlFor="room-name-input"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Room Name
                </label>
                <div className="flex gap-2">
                  <Input
                    id="room-name-input"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. cosmic-nexus-4821"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 shrink-0"
                    onClick={() => {
                      setRoomName(generateRoomSlug());
                      setMeetingKey(generateMeetingKey());
                    }}
                    title="Generate new room name"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="display-name-input"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Display Name
                </label>
                <Input
                  id="display-name-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {sessionError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {sessionError}
                </div>
              ) : null}

              <Button
                id="start-session-btn"
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => void handleJoinSession()}
                disabled={loading || sessionBusy || !roomName.trim()}
              >
                {loading || sessionBusy ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating Session…
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Start Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Share & Info card */}
          <div className="space-y-5">
            <Card className="bg-secondary/45" id="session-share-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">Invite Partner</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Share this link with your study partner to join the same
                  session. They&apos;ll be connected to your room instantly.
                </p>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1 truncate rounded-xl border border-border/70 bg-background/80 px-4 py-3 font-mono text-xs text-muted-foreground">
                    {shareUrl || "Generating link…"}
                  </div>
                  <Button
                    id="copy-link-btn"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs font-medium text-green-600">
                    ✓ Link copied to clipboard!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-secondary/45">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Up to <strong>2 participants</strong> per session for
                      focused pair-study. Audio, video, screen share & chat
                      included.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                    <MonitorPlay className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Powered by <strong>8x8 JaaS</strong> — production-ready,
                      embedded video sessions with room-scoped access and live collaboration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active call controls bar */}
      {inCall && (
        <Card
          className="border-2 border-accent/40 bg-[linear-gradient(135deg,rgba(255,48,0,0.04),transparent_48%)]"
          id="session-active-bar"
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Radio className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Live Session
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="accent" className="text-[0.6rem]">
                    {roomName}
                  </Badge>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>
            </div>

            <Button
              id="leave-session-btn"
              variant="outline"
              onClick={() => void handleLeaveSession()}
              disabled={sessionBusy}
              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            >
              {sessionBusy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Finalizing…
                </>
              ) : (
                <>
                  <VideoOff className="h-4 w-4" />
                  End Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {inCall ? (
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Session Transcript Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Phase 2 streams transcript chunks live to backend. You can also paste/edit
              transcript manually before ending the session.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={liveTranscriptRunning ? "outline" : "dark"}
                onClick={liveTranscriptRunning ? stopLiveTranscript : startLiveTranscript}
                disabled={!liveTranscriptSupported}
              >
                {liveTranscriptRunning ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Live Transcript
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Live Transcript
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleLiveInsights()}
                disabled={insightBusy || !activeSession}
              >
                {insightBusy ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Generating Insights
                  </>
                ) : (
                  <>
                    <WandSparkles className="h-4 w-4" />
                    Live AI Insights
                  </>
                )}
              </Button>
              {uploadingChunk ? <Badge variant="subtle">syncing transcript...</Badge> : null}
            </div>
            {!liveTranscriptSupported ? (
              <p className="text-xs text-muted-foreground">
                Browser speech recognition not supported. Use manual transcript text or Sarvam audio URL.
              </p>
            ) : null}
            {liveTranscriptError ? (
              <p className="text-xs text-destructive">{liveTranscriptError}</p>
            ) : null}
            <Textarea
              value={transcriptDraft}
              onChange={(event) => setTranscriptDraft(event.target.value)}
              placeholder="Paste transcript or meeting notes here. This is analyzed when you end the session."
              className="min-h-[180px]"
            />
            <Input
              value={sarvamAudioUrl}
              onChange={(event) => setSarvamAudioUrl(event.target.value)}
              placeholder="Optional: Sarvam audio URL for ASR fallback"
            />
            {activeSession ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Session ID: {activeSession.sessionId}
              </p>
            ) : null}
            {liveInsights ? (
              <div className="space-y-2 rounded-xl border border-border/70 bg-secondary/45 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Live summary
                </p>
                <p className="text-sm leading-6 text-foreground/90">{liveInsights.summary}</p>
                {liveInsights.keyPoints.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {liveInsights.keyPoints.slice(0, 4).map((point, index) => (
                      <li key={`${liveInsights.sessionId}-live-${index}`}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {lastSummary ? (
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Latest Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-foreground/90">{lastSummary.summary || "No summary available yet."}</p>
            {lastSummary.keyPoints.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Key points
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {lastSummary.keyPoints.map((point, index) => (
                    <li key={`${lastSummary.sessionId}-kp-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {lastProgressUpdates.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Progress updates extracted
                </p>
                <div className="grid gap-2">
                  {lastProgressUpdates.map((update) => (
                    <div key={update.progressUpdateId} className="rounded-xl border border-border/70 bg-secondary/45 p-3">
                      <p className="text-sm font-semibold">{update.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assigned to {update.userName} · confidence {(update.aiConfidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Jitsi iframe container */}
      <div
        ref={jitsiContainerRef}
        id="jitsi-container"
        className={cn(
          "overflow-hidden rounded-[1.75rem] border transition-all duration-300",
          inCall
            ? "h-[calc(100vh-16rem)] min-h-[500px] border-border/70 shadow-[0_28px_72px_rgba(19,19,19,0.12)]"
            : "h-0 border-transparent",
        )}
      />
    </div>
  );
}

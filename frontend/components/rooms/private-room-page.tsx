"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  FileUp,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  SendHorizontal,
} from "lucide-react";

import {
  listRoomDocumentsApi,
  processRoomDocumentApi,
  queryRoomKnowledgeApi,
  type ApiRagResponse,
  type ApiRoomDocument,
  RoomApiError,
  uploadRoomDocumentApi,
} from "@/lib/api/private-room";
import { useAuthStore } from "@/lib/auth/auth-store";
import { getMemberById, type RoomDiscussionEntry } from "@/lib/mock/rooms";
import { useRoomStore } from "@/lib/rooms/room-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const roomTabs = [
  { id: "discussion", label: "Discussion", icon: MessageSquareText },
  { id: "resources", label: "Resources", icon: FileUp },
  { id: "knowledge", label: "Knowledge", icon: BrainCircuit },
  { id: "activity", label: "Activity", icon: Sparkles },
] as const;

type RoomTab = (typeof roomTabs)[number]["id"];

function formatRelativeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function summarizeSource(text: string, maxLength = 220) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function extractSyncBotPrompt(message: string) {
  const mentionRegex = /@sync_bot\b/i;
  if (!mentionRegex.test(message)) {
    return null;
  }

  return message.replace(mentionRegex, "").trim();
}

function statusBadgeVariant(status: ApiRoomDocument["index_status"]) {
  if (status === "indexed") {
    return "default";
  }

  if (status === "processing") {
    return "accent";
  }

  return "subtle";
}

function KnowledgePanel({
  roomId,
  backendReady,
}: {
  roomId: string;
  backendReady: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState<ApiRoomDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [ragResponse, setRagResponse] = useState<ApiRagResponse | null>(null);
  const [querying, setQuerying] = useState(false);

  const refreshDocuments = useCallback(async () => {
    if (!backendReady) {
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const nextDocuments = await listRoomDocumentsApi(roomId);
      setDocuments(nextDocuments);
    } catch (error) {
      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Could not load room documents from the backend service.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, [backendReady, roomId]);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  async function handleUpload() {
    if (!selectedFile) {
      setDocumentsError("Choose a PDF before uploading.");
      return;
    }

    setUploading(true);
    setDocumentsError(null);

    try {
      const uploadedDocument = await uploadRoomDocumentApi(
        roomId,
        selectedFile,
        user?.email ?? "demo@studysync.ai",
      );

      await processRoomDocumentApi(roomId, uploadedDocument.document_id);
      setSelectedFile(null);
      await refreshDocuments();
    } catch (error) {
      setDocumentsError(
        error instanceof RoomApiError
          ? error.message
          : "Upload or indexing failed for this room.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleQuery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setDocumentsError("Enter a grounded room question before querying.");
      return;
    }

    setQuerying(true);
    setDocumentsError(null);

    try {
      const response = await queryRoomKnowledgeApi(roomId, {
        query: query.trim(),
        top_k: 5,
      });
      setRagResponse(response);
    } catch (error) {
      setDocumentsError(
        error instanceof RoomApiError
          ? error.message
          : "Room retrieval failed. Check the FastAPI service and room state.",
      );
    } finally {
      setQuerying(false);
    }
  }

  const indexedDocuments = documents.filter((document) => document.index_status === "indexed");

  if (!backendReady) {
    return (
      <Card className="border border-dashed border-border/70 bg-secondary/45">
        <CardContent className="space-y-3 p-4">
          <Badge variant="subtle">Backend connection required</Badge>
          <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
            Knowledge indexing unlocks on synced rooms
          </h4>
          <p className="text-sm leading-6 text-muted-foreground">
            This seeded room is a frontend demo room. Create a new private room while
            the FastAPI service is running to upload PDFs, process chunks, and ask
            grounded room-scoped questions here.
          </p>
          <Button asChild variant="dark">
            <Link href="/rooms">
              Create backend room
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Badge variant="accent">Upload Resource</Badge>
              <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                Add room PDFs
              </h4>
              <p className="text-sm leading-6 text-muted-foreground">
                Upload a PDF, store it locally, process it incrementally, and make it
                immediately retrievable inside this room.
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="dark" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading and indexing
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      Upload and index
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => void refreshDocuments()} disabled={documentsLoading}>
                  <RefreshCw className={cn("h-4 w-4", documentsLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Badge variant="accent">Resources</Badge>
              <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                Room document list
              </h4>
            </div>

            {documentsLoading ? (
              <div className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-5 text-sm text-muted-foreground">
                Loading room documents...
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.document_id}
                    className="rounded-[1.25rem] border border-border/70 bg-secondary/45 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{document.filename}</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {document.page_count > 0
                            ? `${document.page_count} pages`
                            : "Waiting for page count"}{" "}
                          · {document.chunk_count} chunks
                        </p>
                      </div>
                      <Badge variant={statusBadgeVariant(document.index_status)}>
                        {document.index_status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Uploaded {new Date(document.upload_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border/70 bg-secondary/45 px-4 py-5 text-sm leading-6 text-muted-foreground">
                No PDFs indexed in this room yet. Upload a room resource to activate the
                knowledge panel.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border border-border/70">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Badge variant="accent">Room Knowledge Query</Badge>
              <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                Ask this room
              </h4>
            </div>

            <form className="space-y-3" onSubmit={handleQuery}>
              <Textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What does our OS PDF say about deadlock prevention?"
                className="min-h-[150px]"
              />
              <Button
                type="submit"
                variant="dark"
                className="w-full sm:w-auto"
                disabled={querying || indexedDocuments.length === 0}
              >
                {querying ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Querying room
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    Ask knowledge layer
                  </>
                )}
              </Button>
            </form>

            {documentsError ? (
              <div className="rounded-[1.2rem] border border-destructive/25 bg-[#fff1ed] px-4 py-3 text-sm leading-6 text-destructive">
                {documentsError}
              </div>
            ) : null}

            {ragResponse ? (
              <div className="space-y-4">
                <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Grounded answer
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground">
                    {ragResponse.answer}
                  </p>
                </div>

                <div className="space-y-3">
                {ragResponse.results.map((result) => (
                    <div
                      key={result.chunk_id}
                      className="rounded-[1.25rem] border border-border/70 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="subtle">{result.filename}</Badge>
                        <Badge variant="outline">Page {result.page_number}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {summarizeSource(result.text, 320)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border/70 bg-secondary/45 px-4 py-5 text-sm leading-6 text-muted-foreground">
                {indexedDocuments.length === 0
                  ? "Index at least one PDF in this room, then ask grounded questions here."
                  : "Ask a room-specific question to see grounded passages and source references."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PrivateRoomPage({ roomId }: { roomId: string }) {
  const room = useRoomStore((state) => state.rooms.find((entry) => entry.roomId === roomId));
  const addDiscussionEntry = useRoomStore((state) => state.addDiscussionEntry);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<RoomTab>("discussion");
  const [chatDraft, setChatDraft] = useState("");
  const [botLoading, setBotLoading] = useState(false);

  const members = useMemo(
    () => room?.memberIds.map((memberId) => getMemberById(memberId)).filter(Boolean) ?? [],
    [room],
  );
  const currentMember =
    members.find((member) => member?.name.toLowerCase() === user?.name?.toLowerCase()) ??
    getMemberById(room?.createdBy ?? "user-aryan");

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!room || !chatDraft.trim()) {
      return;
    }

    const content = chatDraft.trim();
    const messageId = `discussion-${room.roomId}-${Date.now()}`;
    const authorId = currentMember?.id ?? room.createdBy;
    const authorLabel = currentMember?.name ?? user?.name ?? "You";

    const userEntry: RoomDiscussionEntry = {
      id: messageId,
      authorId,
      authorType: "member",
      authorLabel,
      content,
      createdAt: formatRelativeNow(),
    };

    addDiscussionEntry(room.roomId, userEntry);
    setChatDraft("");

    const botPrompt = extractSyncBotPrompt(content);
    if (botPrompt === null) {
      return;
    }

    setBotLoading(true);

    if (!room.backendReady) {
      addDiscussionEntry(room.roomId, {
        id: `${messageId}-bot-offline`,
        authorId: "sync-bot",
        authorType: "bot",
        authorLabel: "SYNC_BOT",
        content:
          "This room is local-only right now. Start the backend, create a backend-connected room, upload a PDF in Knowledge, then tag me again.",
        createdAt: formatRelativeNow(),
      });
      setBotLoading(false);
      return;
    }

    if (!botPrompt) {
      addDiscussionEntry(room.roomId, {
        id: `${messageId}-bot-empty`,
        authorId: "sync-bot",
        authorType: "bot",
        authorLabel: "SYNC_BOT",
        content: "Tag me with a direct question, for example: @SYNC_BOT what does the uploaded PDF say about deadlock prevention?",
        createdAt: formatRelativeNow(),
      });
      setBotLoading(false);
      return;
    }

    try {
      const response = await queryRoomKnowledgeApi(room.roomId, {
        query: botPrompt,
        top_k: 4,
      });

      addDiscussionEntry(room.roomId, {
        id: `${messageId}-bot`,
        authorId: "sync-bot",
        authorType: "bot",
        authorLabel: "SYNC_BOT",
        content: response.answer,
        createdAt: formatRelativeNow(),
        sources: response.results.slice(0, 3).map((result) => ({
          chunkId: result.chunk_id,
          filename: result.filename,
          pageNumber: result.page_number,
          excerpt: summarizeSource(result.text),
        })),
      });
    } catch (error) {
      addDiscussionEntry(room.roomId, {
        id: `${messageId}-bot-error`,
        authorId: "sync-bot",
        authorType: "bot",
        authorLabel: "SYNC_BOT",
        content:
          error instanceof RoomApiError
            ? error.message
            : "I could not query the room knowledge layer right now.",
        createdAt: formatRelativeNow(),
      });
    } finally {
      setBotLoading(false);
    }
  }

  if (!room) {
    return (
      <Card className="border border-dashed border-border/70 bg-secondary/45">
        <CardContent className="space-y-4 p-5">
          <Badge variant="subtle">Room not found</Badge>
          <div>
            <h2 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.06em]">
              This private room does not exist in local state
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create a new private room or reopen one from the room list to continue.
            </p>
          </div>
          <Button asChild variant="dark">
            <Link href="/rooms">
              Back to rooms
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border border-border/70">
        <CardContent className="grid gap-4 p-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Private Room</Badge>
              <Badge variant={room.backendReady ? "default" : "subtle"}>
                {room.backendReady ? "FastAPI room active" : "Frontend room only"}
              </Badge>
            </div>

            <div>
              <h2 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-5xl">
                {room.title}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {room.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {members.map((member) =>
                member ? (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.68rem] uppercase ${member.accent}`}>
                      {member.name.slice(0, 1)}
                    </span>
                    {member.name}
                  </span>
                ) : null,
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-border/70 bg-sidebar p-4 text-sidebar-foreground">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Last activity
              </p>
              <p className="mt-3 text-sm leading-6 text-sidebar-foreground/76">
                {room.lastActivity}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next focus
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">{room.nextFocus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {roomTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/70 bg-white text-foreground hover:bg-secondary/80",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "discussion" ? (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                {room.discussion.map((entry) => {
                  const author = getMemberById(entry.authorId);
                  const displayName =
                    entry.authorType === "bot"
                      ? entry.authorLabel ?? "SYNC_BOT"
                      : author?.name ?? entry.authorLabel ?? "Room member";

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-[1.25rem] border p-4",
                        entry.authorType === "bot"
                          ? "border-sidebar bg-sidebar text-sidebar-foreground"
                          : "border-border/70 bg-secondary/45",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "font-semibold",
                            entry.authorType === "bot"
                              ? "text-sidebar-foreground"
                              : "text-foreground",
                          )}
                        >
                          {displayName}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-[0.18em]",
                            entry.authorType === "bot"
                              ? "text-sidebar-foreground/56"
                              : "text-muted-foreground",
                          )}
                        >
                          {entry.createdAt}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-3 whitespace-pre-line text-sm leading-6",
                          entry.authorType === "bot"
                            ? "text-sidebar-foreground/78"
                            : "text-muted-foreground",
                        )}
                      >
                        {entry.content}
                      </p>

                      {entry.sources?.length ? (
                        <div className="mt-4 space-y-2">
                          {entry.sources.map((source) => (
                            <div
                              key={source.chunkId}
                              className={cn(
                                "rounded-[1rem] border px-3 py-3 text-sm",
                                entry.authorType === "bot"
                                  ? "border-sidebar-foreground/10 bg-white/[0.06] text-sidebar-foreground/76"
                                  : "border-border/70 bg-white text-muted-foreground",
                              )}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={entry.authorType === "bot" ? "accent" : "subtle"}>
                                  {source.filename}
                                </Badge>
                                <Badge variant="outline">Page {source.pageNumber}</Badge>
                              </div>
                              <p className="mt-2 leading-6">{source.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {botLoading ? (
                  <div className="rounded-[1.25rem] border border-sidebar bg-sidebar p-4 text-sidebar-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-sidebar-foreground">SYNC_BOT</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/56">
                        Thinking
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-sidebar-foreground/78">
                      Retrieving room-scoped knowledge and preparing a grounded reply...
                    </p>
                  </div>
                ) : null}
              </div>

              <form
                className="space-y-3 rounded-[1.25rem] border border-border/70 bg-white p-4"
                onSubmit={handleSendMessage}
              >
                <div className="space-y-2">
                  <Badge variant="accent">Room Chat</Badge>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Chat normally with the group, or tag{" "}
                    <span className="font-semibold text-foreground">@SYNC_BOT</span> to query
                    indexed room knowledge directly in the thread.
                  </p>
                </div>
                <Textarea
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  placeholder="Type a group message, or try: @SYNC_BOT what does the uploaded PDF say about deadlock prevention?"
                  className="min-h-[120px]"
                />
                <Button type="submit" variant="dark" disabled={botLoading}>
                  {botLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      SYNC_BOT is thinking
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-secondary/45">
            <CardContent className="space-y-3 p-4">
              <Badge variant="accent">Discussion + bot</Badge>
              <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                Use chat as the main surface
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Group messages stay in the room thread. When you need grounded help,
                call the bot directly with <span className="font-semibold text-foreground">@SYNC_BOT</span>.
              </p>
              <div className="rounded-[1rem] border border-border/70 bg-white px-4 py-3 text-sm leading-6 text-muted-foreground">
                Example:
                <p className="mt-2 font-medium text-foreground">
                  @SYNC_BOT what are the key observations from the uploaded contest PDF?
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "resources" ? (
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            {room.resources.map((resource) => (
              <div key={resource.id} className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{resource.name}</p>
                  <Badge variant={resource.status === "indexed" ? "default" : "subtle"}>
                    {resource.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {resource.type} resource updated {resource.updatedAt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "knowledge" ? (
        <KnowledgePanel roomId={room.roomId} backendReady={room.backendReady} />
      ) : null}

      {activeTab === "activity" ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {room.activity.map((entry) => (
              <div key={entry.id} className="rounded-[1.25rem] border border-border/70 bg-secondary/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                    {entry.label}
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {entry.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

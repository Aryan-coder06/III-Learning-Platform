"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Copy,
  FileText,
  FileUp,
  Library,
  LoaderCircle,
  RefreshCw,
  SendHorizontal,
  Sparkles,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  getRoomDetailApi,
  inviteRoomMembersApi,
  listRoomDocumentsApi,
  listRoomMessagesApi,
  processRoomDocumentApi,
  queryRoomKnowledgeApi,
  RoomApiError,
  type ApiPrivateRoom,
  type ApiRagResponse,
  type ApiRoomDocument,
  type ApiRoomMessage,
  uploadRoomDocumentApi,
} from "@/lib/api/private-room";
import { getUserApi, type UserFile } from "@/lib/api/user";
import { useAuthStore } from "@/lib/auth/auth-store";
import { identityFromUser } from "@/lib/auth/identity";
import { getSocket } from "@/lib/socket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SideTab = "knowledge" | "resources" | "activity";

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function summarizeSource(text: string, maxLength = 220) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function recentMessagesForQuery(messages: ApiRoomMessage[]) {
  return messages.slice(-8).map((message) => ({
    sender_name: message.senderName,
    message_type: message.messageType,
    content: message.content,
    timestamp: message.createdAt,
  }));
}

function KnowledgeSidebar({
  room,
  currentUserId,
  recentMessages,
}: {
  room: ApiPrivateRoom;
  currentUserId: string;
  recentMessages: ApiRoomMessage[];
}) {
  const user = useAuthStore((state) => state.user);
  const actor = useMemo(
    () => ({
      userId: currentUserId,
      name:
        room.members.find((member) => member.userId === currentUserId)?.name ||
        room.createdByName ||
        "User",
      email:
        room.members.find((member) => member.userId === currentUserId)?.email ||
        room.createdByEmail ||
        `${currentUserId}@studysync.local`,
    }),
    [currentUserId, room],
  );
  const [documents, setDocuments] = useState<ApiRoomDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [ragResponse, setRagResponse] = useState<ApiRagResponse | null>(null);
  const [querying, setQuerying] = useState(false);

  // Personal Vault states
  const [personalDocs, setPersonalDocs] = useState<UserFile[]>([]);
  const [showPersonalVault, setShowPersonalVault] = useState(false);
  const [vaultLoading, setVaultLoading] = useState(false);

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const nextDocuments = await listRoomDocumentsApi(room.roomId, currentUserId);
      setDocuments(nextDocuments);
    } catch (error) {
      setDocumentsError(
        error instanceof Error ? error.message : "Could not load room documents.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, [currentUserId, room.roomId]);

  const fetchPersonalDocs = useCallback(async () => {
    if (!user?.mongoId) {
      console.warn("No mongoId available for personal vault fetch");
      return;
    }
    setVaultLoading(true);
    try {
      const userData = await getUserApi(user.mongoId);
      setPersonalDocs(userData?.files || []);
    } catch (err) {
      console.error("Failed to fetch personal documents:", err);
    } finally {
      setVaultLoading(false);
    }
  }, [user?.mongoId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshDocuments();
    });
  }, [refreshDocuments]);

  useEffect(() => {
    if (showPersonalVault) {
      fetchPersonalDocs();
    }
  }, [showPersonalVault, fetchPersonalDocs]);

  async function handleUpload() {
    if (!selectedFile) {
      setDocumentsError("Choose a PDF before uploading.");
      return;
    }

    setUploading(true);
    setDocumentsError(null);

    try {
      const uploadedDocument = await uploadRoomDocumentApi(room.roomId, selectedFile, actor);
      await processRoomDocumentApi(room.roomId, uploadedDocument.document_id, currentUserId);
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

  async function handleImportFromVault(doc: UserFile) {
    setUploading(true);
    setDocumentsError(null);
    try {
      if (!doc.url) {
        throw new Error("Document URL is missing.");
      }
      // Fetch the file from Cloudinary URL
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const fileName = doc.name || doc.filename || "vault-import.pdf";
      const file = new File([blob], fileName, { type: blob.type || "application/pdf" });

      const uploadedDocument = await uploadRoomDocumentApi(room.roomId, file, actor);
      await processRoomDocumentApi(room.roomId, uploadedDocument.document_id, currentUserId);
      await refreshDocuments();
      setShowPersonalVault(false);
    } catch (error) {
      setDocumentsError(
        error instanceof RoomApiError
          ? error.message
          : "Failed to import from your personal vault. Check if the file is still available.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleExplicitQuery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setDocumentsError("Enter a room question before querying.");
      return;
    }

    setQuerying(true);
    setDocumentsError(null);

    try {
      const response = await queryRoomKnowledgeApi(room.roomId, {
        query: query.trim(),
        top_k: 5,
        actor,
        recent_messages: recentMessagesForQuery(recentMessages),
      });
      setRagResponse(response);
    } catch (error) {
      setDocumentsError(
        error instanceof RoomApiError
          ? error.message
          : "Room retrieval failed. Check the AI service and indexed resources.",
      );
    } finally {
      setQuerying(false);
    }
  }

  const indexedDocuments = documents.filter((document) => document.index_status === "indexed");

  return (
    <div className="space-y-4">
      <Card className="border border-border/70">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <Badge variant="accent">Upload Resource</Badge>
            <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
              Feed the room
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Upload from local PC or choose from your personal vault.
            </p>
          </div>

          {!showPersonalVault ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="dark" onClick={handleUpload} disabled={uploading} className="flex-1">
                  {uploading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      Upload PDF
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPersonalVault(true)}
                  disabled={uploading}
                >
                  <Library className="h-4 w-4" />
                  My Documents
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select from Personal Vault
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowPersonalVault(false)} className="h-7 px-2 text-xs">
                  Back to local upload
                </Button>
              </div>
              
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {vaultLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : personalDocs.length > 0 ? (
                  personalDocs.map((doc, idx) => (
                    <button
                      key={doc.url || idx}
                      onClick={() => handleImportFromVault(doc)}
                      disabled={uploading}
                      className="w-full flex items-center gap-3 rounded-[1rem] border border-border/70 bg-secondary/20 p-3 text-left transition-colors hover:bg-secondary/40 disabled:opacity-50"
                    >
                      <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {doc.format || "PDF"} • {doc.date || "Personal Vault"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 bg-secondary/10 rounded-xl border border-dashed border-border/70">
                    <p className="text-xs text-muted-foreground">No personal documents found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => void refreshDocuments()} disabled={documentsLoading} className="w-full">
            <RefreshCw className={cn("h-4 w-4", documentsLoading && "animate-spin")} />
            Refresh Indexed Documents
          </Button>

          {documentsError ? (
            <div className="rounded-[1rem] border border-destructive/25 bg-[#fff1ed] px-4 py-3 text-sm leading-6 text-destructive">
              {documentsError}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-border/70">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <Badge variant="accent">Room Knowledge</Badge>
            <h4 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
              Ask explicitly
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Chat is the main surface. This panel is useful when you want a focused one-off answer.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleExplicitQuery}>
            <Textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Summarize the uploaded notes and explain the main idea simply."
              className="min-h-[110px]"
            />
            <Button
              type="submit"
              variant="dark"
              className="w-full"
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
                  Ask room knowledge
                </>
              )}
            </Button>
          </form>

          {ragResponse ? (
            <div className="space-y-3">
              <div className="rounded-[1.15rem] border border-border/70 bg-secondary/45 p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Intent
                </p>
                <p className="mt-2 font-semibold text-foreground">{ragResponse.intent || "grounded answer"}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {ragResponse.answer}
                </p>
              </div>
              {ragResponse.results.slice(0, 3).map((result) => (
                <div
                  key={result.chunk_id}
                  className="rounded-[1rem] border border-border/70 bg-white px-4 py-3 text-sm text-muted-foreground"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="subtle">{result.filename}</Badge>
                    <Badge variant="outline">Page {result.page_number}</Badge>
                  </div>
                  <p className="mt-2 leading-6">{result.excerpt || summarizeSource(result.text, 240)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1rem] border border-dashed border-border/70 bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
              {indexedDocuments.length === 0
                ? "Index at least one document, then ask the room assistant here or in chat."
                : "Prefer asking @SYNC_BOT directly in chat for the most natural collaborative flow."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/70">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-[var(--font-display)] text-xl font-bold uppercase tracking-[-0.05em]">
                Indexed resources
              </h4>
              <p className="text-sm text-muted-foreground">Room document list and indexing state.</p>
            </div>
            <Badge variant="subtle">{documents.length} docs</Badge>
          </div>

          {documents.length > 0 ? (
            documents.map((document) => (
              <div
                key={document.document_id}
                className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{document.filename}</p>
                  <Badge variant={document.index_status === "indexed" ? "default" : "subtle"}>
                    {document.index_status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {document.page_count > 0 ? `${document.page_count} pages` : "Pending pages"} ·{" "}
                  {document.chunk_count} chunks
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[1rem] border border-dashed border-border/70 bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
              No resources uploaded yet. Feed the room before using grounded help.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: ApiRoomMessage;
  currentUserId: string;
}) {
  const isOwn = message.senderId === currentUserId;
  const isBot = message.messageType === "bot";
  const isSystem = message.messageType === "system";

  return (
    <div
      className={cn(
        "max-w-[86%] rounded-[1.35rem] border px-4 py-3",
        isBot
          ? "border-sidebar bg-sidebar text-sidebar-foreground"
          : isSystem
            ? "mx-auto w-full max-w-full border-border/70 bg-secondary/45 text-foreground"
            : isOwn
              ? "ml-auto border-accent/20 bg-accent/8"
              : "border-border/70 bg-white",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              isBot ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            {message.senderName}
          </span>
          {isBot ? <Badge variant="accent">SYNC_BOT</Badge> : null}
          {isSystem ? <Badge variant="subtle">System</Badge> : null}
        </div>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            isBot ? "text-sidebar-foreground/56" : "text-muted-foreground",
          )}
        >
          {formatTimestamp(message.createdAt)}
        </span>
      </div>

      <p
        className={cn(
          "mt-3 whitespace-pre-line text-sm leading-6",
          isBot ? "text-sidebar-foreground/78" : "text-muted-foreground",
        )}
      >
        {message.content}
      </p>

      {message.sources?.length ? (
        <div className="mt-4 space-y-2">
          {message.sources.map((source) => (
            <div
              key={`${message.messageId}-${source.chunkId}`}
              className={cn(
                "rounded-[1rem] border px-3 py-3 text-sm",
                isBot
                  ? "border-sidebar-foreground/12 bg-white/[0.06] text-sidebar-foreground/76"
                  : "border-border/70 bg-secondary/45 text-muted-foreground",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isBot ? "accent" : "subtle"}>{source.filename}</Badge>
                <Badge variant="outline">Page {source.pageNumber}</Badge>
              </div>
              <p className="mt-2 leading-6">{source.excerpt}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PrivateRoomPage({ roomId }: { roomId: string }) {
  const user = useAuthStore((state) => state.user);
  const identity = useMemo(() => identityFromUser(user), [user]);
  const [room, setRoom] = useState<ApiPrivateRoom | null>(null);
  const [messages, setMessages] = useState<ApiRoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<SideTab>("knowledge");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadRoom = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [roomDetail, roomHistory] = await Promise.all([
        getRoomDetailApi(roomId, identity.userId),
        listRoomMessagesApi(roomId, identity.userId),
      ]);
      setRoom(roomDetail);
      setMessages(roomHistory);
    } catch (loadError) {
      setError(
        loadError instanceof RoomApiError
          ? loadError.message
          : "Could not load this room right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [identity.userId, roomId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRoom();
    });
  }, [loadRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      socket.emit("join_room", {
        roomId,
        actor: identity,
      });
    };
    const onDisconnect = () => setConnected(false);
    const onHistory = (history: ApiRoomMessage[]) => {
      setMessages(history);
      setBotTyping(false);
    };
    const onMessage = (message: ApiRoomMessage) => {
      if (message.roomId !== roomId) {
        return;
      }
      setMessages((current) => [...current, message]);
      setBotTyping(false);
      void loadRoom();
    };
    const onBotTyping = (payload: { roomId: string }) => {
      if (payload.roomId === roomId) {
        setBotTyping(true);
      }
    };
    const onError = (payload: { error: string }) => {
      setError(payload.error);
      setBotTyping(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat_history", onHistory);
    socket.on("receive_message", onMessage);
    socket.on("bot_typing", onBotTyping);
    socket.on("message_error", onError);

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    socket.emit("join_room", {
      roomId,
      actor: identity,
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_history", onHistory);
      socket.off("receive_message", onMessage);
      socket.off("bot_typing", onBotTyping);
      socket.off("message_error", onError);
    };
  }, [identity, loadRoom, roomId]);

  async function handleCopyCode() {
    if (!room) {
      return;
    }

    try {
      await navigator.clipboard.writeText(room.roomCode);
    } catch {
      setError("Clipboard access failed. Copy the room code manually.");
    }
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!room) {
      return;
    }

    const emails = inviteEmails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setInviteFeedback("Enter at least one email address.");
      return;
    }

    setInviteLoading(true);
    setInviteFeedback(null);

    try {
      const result = await inviteRoomMembersApi({
        roomId: room.roomId,
        actor: identity,
        emails,
      });
      setInviteFeedback(
        `${result.count} invite${result.count > 1 ? "s" : ""} prepared. Share room code ${room.roomCode} as well.`,
      );
      setInviteEmails("");
      await loadRoom();
    } catch (inviteError) {
      setInviteFeedback(
        inviteError instanceof RoomApiError
          ? inviteError.message
          : "Could not create invites right now.",
      );
    } finally {
      setInviteLoading(false);
    }
  }

  function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      return;
    }

    const socket = getSocket();
    socket.emit("send_message", {
      roomId,
      senderId: identity.userId,
      senderName: identity.name,
      senderEmail: identity.email,
      content,
      messageType: "human",
    });
    setDraft("");
    if (/@sync_bot\b/i.test(content)) {
      setBotTyping(true);
    }
  }

  if (loading) {
    return (
      <Card className="border border-border/70">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading room workspace...
        </CardContent>
      </Card>
    );
  }

  if (!room) {
    return (
      <Card className="border border-dashed border-border/70 bg-secondary/45">
        <CardContent className="space-y-4 p-5">
          <Badge variant="subtle">Room not available</Badge>
          <div>
            <h2 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.06em]">
              This private room could not be loaded
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Join with a valid room code or reopen a room from the directory.
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
        <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Private Room</Badge>
              <Badge variant={room.aiRoomReady ? "default" : "subtle"}>
                {room.aiRoomReady ? "AI room ready" : "AI sync pending"}
              </Badge>
              <Badge variant="subtle">{connected ? "Live socket connected" : "Socket reconnecting"}</Badge>
            </div>

            <div>
              <h2 className="font-[var(--font-display)] text-4xl font-bold uppercase tracking-[-0.08em] md:text-5xl">
                {room.title}
              </h2>
              <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">
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
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Room code
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.05em]">
                  {room.roomCode}
                </span>
                <Button type="button" variant="outline" className="h-10 px-4" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-sidebar p-4 text-sidebar-foreground">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/56">
                Live status
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {connected ? <Wifi className="h-4 w-4 text-accent" /> : <WifiOff className="h-4 w-4 text-accent" />}
                <span className="text-sidebar-foreground/80">
                  {connected ? "Room chat connected" : "Waiting for socket connection"}
                </span>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Last activity
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">{room.lastActivity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-destructive/30 bg-[#fff1ed]">
          <CardContent className="p-4 text-sm leading-6 text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="border border-border/70">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Badge variant="accent">Room Info</Badge>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Team capsule
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Share this room code with trusted collaborators and keep resources room-bound.
                </p>
              </div>

              <div className="space-y-2">
                {room.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 rounded-[1rem] border border-border/70 bg-secondary/45 px-3 py-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold uppercase text-foreground">
                      {member.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{member.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm text-muted-foreground">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Next focus
                </p>
                <p className="mt-2 text-foreground">{room.nextFocus}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Badge variant="accent">Invite Users</Badge>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Invite by email
                </h3>
              </div>

              <form className="space-y-3" onSubmit={handleInvite}>
                <Textarea
                  value={inviteEmails}
                  onChange={(event) => setInviteEmails(event.target.value)}
                  placeholder="rina@college.edu, kabir@college.edu"
                  className="min-h-[120px]"
                />
                <Button type="submit" variant="dark" className="w-full" disabled={inviteLoading}>
                  {inviteLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Preparing invites
                    </>
                  ) : (
                    <>
                      <UsersRound className="h-4 w-4" />
                      Invite collaborators
                    </>
                  )}
                </Button>
              </form>

              {inviteFeedback ? (
                <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {inviteFeedback}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "knowledge", label: "Knowledge", icon: BrainCircuit },
              { id: "resources", label: "Resources", icon: FileUp },
              { id: "activity", label: "Activity", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSideTab(tab.id as SideTab)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]",
                    sideTab === tab.id
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

          {sideTab === "knowledge" ? (
            <KnowledgeSidebar
              room={room}
              currentUserId={identity.userId}
              recentMessages={messages}
            />
          ) : null}

          {sideTab === "resources" ? (
            <Card className="border border-border/70">
              <CardContent className="space-y-3 p-4">
                <Badge variant="accent">Resources snapshot</Badge>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Room assets stay secondary
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  The room works through chat first. Uploads and source tracking stay available here without overtaking the collaboration area.
                </p>
                <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Use the Knowledge tab to upload PDFs and monitor indexing.
                </div>
              </CardContent>
            </Card>
          ) : null}

          {sideTab === "activity" ? (
            <Card className="border border-border/70">
              <CardContent className="space-y-3 p-4">
                <Badge variant="accent">Activity</Badge>
                <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                  Room momentum
                </h3>
                <div className="space-y-3">
                  <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Updated
                    </p>
                    <p className="mt-2 text-sm text-foreground">{formatTimestamp(room.updatedAt)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Latest
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{room.lastActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="border border-border/70 xl:col-span-full">
          <CardContent className="flex h-[calc(100vh-19rem)] min-h-[38rem] flex-col p-0">
            <div className="border-b border-border/70 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">Live Discussion</Badge>
                    <Badge variant="subtle">{messages.length} messages</Badge>
                  </div>
                  <h3 className="mt-3 font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.06em]">
                    Chat-first room
                  </h3>
                </div>
                <div className="max-w-sm rounded-[1rem] border border-border/70 bg-secondary/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Tag <span className="font-semibold text-foreground">@SYNC_BOT</span> in this thread for grounded, tutor-like answers based on room uploads.
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {messages.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.messageId}
                      message={message}
                      currentUserId={identity.userId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md space-y-3">
                    <Badge variant="subtle">Start the room</Badge>
                    <h4 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.05em]">
                      No messages yet
                    </h4>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Start the group discussion here. Once resources are uploaded, mention @SYNC_BOT directly in chat to get grounded room help.
                    </p>
                  </div>
                </div>
              )}

              {botTyping ? (
                <div className="max-w-[86%] rounded-[1.35rem] border border-sidebar bg-sidebar px-4 py-3 text-sidebar-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">SYNC_BOT</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/56">
                      Thinking
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-sidebar-foreground/76">
                    Retrieving room materials and preparing a grounded reply...
                  </p>
                </div>
              ) : null}

              <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="mt-auto border-t border-border/70 bg-white px-4 py-4">
              <form onSubmit={handleSendMessage}>
                <div className="rounded-[1.35rem] border border-border/70 bg-secondary/20 p-3">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Chat with the room, or try: @SYNC_BOT explain deadlock simply from the uploaded notes."
                    className="min-h-[100px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="hidden text-xs leading-5 text-muted-foreground sm:block lg:max-w-[240px] xl:max-w-none">
                      Human messages and bot replies are stored in room history for everyone who joins later.
                    </p>
                    <Button type="submit" variant="dark" className="ml-auto shrink-0">
                      <SendHorizontal className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

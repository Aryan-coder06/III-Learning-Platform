"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Crown,
  Hash,
  Loader2,
  Plus,
  Search,
  Send,
  Shield,
  SmilePlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import {
  publicChannels,
  channelMembers,
  type Channel,
  type ChannelMember,
} from "@/lib/mock/public-rooms";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type LiveMessage = {
  _id: string;
  channelId: string;
  senderName: string;
  content: string;
  type: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/*  Channel Sidebar                                                    */
/* ------------------------------------------------------------------ */

function ChannelSidebar({
  activeChannelId,
  onSelect,
  connected,
}: {
  activeChannelId: string;
  onSelect: (id: string) => void;
  connected: boolean;
}) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmOpen, setDmOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = publicChannels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="border-b border-sidebar-foreground/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-[-0.04em]">
            Public Rooms
          </h2>
          {connected ? (
            <Wifi className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>
        <p className="mt-1 text-xs text-sidebar-foreground/50">
          {publicChannels.length} channels available
        </p>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/40" />
          <input
            type="text"
            placeholder="Search channels…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sidebar-foreground/10 bg-sidebar-foreground/6 py-2 pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/36 focus:border-sidebar-foreground/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <button
          type="button"
          onClick={() => setChannelsOpen(!channelsOpen)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/50 hover:text-sidebar-foreground/70"
        >
          {channelsOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Channels
        </button>

        {channelsOpen && (
          <div className="space-y-0.5">
            {filtered.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelect(channel.id)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                  activeChannelId === channel.id
                    ? "bg-white/12 font-semibold text-sidebar-foreground"
                    : "text-sidebar-foreground/68 hover:bg-white/6 hover:text-sidebar-foreground/90"
                )}
              >
                <Hash className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
                <span className="flex-1 truncate text-left">{channel.name}</span>
                {channel.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.65rem] font-bold text-accent-foreground">
                    {channel.unread}
                  </span>
                )}
              </button>
            ))}

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/40 hover:bg-white/5 hover:text-sidebar-foreground/60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add channels</span>
            </button>
          </div>
        )}

        {/* Direct Messages section */}
        <button
          type="button"
          onClick={() => setDmOpen(!dmOpen)}
          className="mt-4 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/50 hover:text-sidebar-foreground/70"
        >
          {dmOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Direct messages
        </button>

        {dmOpen && (
          <div className="space-y-0.5">
            {["Priya Sharma", "Rahul Mehta", "Vikram Joshi"].map((name) => (
              <button
                key={name}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/68 hover:bg-white/6 hover:text-sidebar-foreground/90"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-foreground/12 text-[0.6rem] font-semibold uppercase">
                  {name[0]}
                </span>
                <span className="flex-1 truncate text-left">{name}</span>
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message Area                                                       */
/* ------------------------------------------------------------------ */

function MessageArea({
  channel,
  messages,
  loading,
  onSend,
  currentUser,
}: {
  channel: Channel;
  messages: LiveMessage[];
  loading: boolean;
  onSend: (content: string) => void;
  currentUser: string;
}) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Channel header */}
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-[-0.04em]">
            {channel.name}
          </h3>
        </div>
        <span className="hidden text-sm text-muted-foreground md:inline">
          {channel.description}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="subtle" className="gap-1">
            <Users className="h-3 w-3" />
            {channel.memberCount}
          </Badge>
        </div>
      </div>

      {/* Topic banner */}
      <div className="border-b border-border/70 bg-secondary/30 px-5 py-2 text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.16em] text-accent">
          Topic:
        </span>{" "}
        {channel.description}
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Loading messages…</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-secondary/45">
                  <Hash className="h-7 w-7 text-muted-foreground" />
                </div>
                <h4 className="mt-4 font-[var(--font-display)] text-xl font-bold uppercase tracking-[-0.04em]">
                  Welcome to #{channel.name}
                </h4>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  This is the start of the #{channel.name} channel. Send a message to
                  start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderName === currentUser;
                const initials = msg.senderName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={msg._id} className="group flex gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold uppercase",
                        isOwn
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border/70 bg-secondary/45 text-muted-foreground"
                      )}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-sm font-bold", isOwn ? "text-accent" : "text-foreground")}>
                          {msg.senderName}
                          {isOwn && <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">(you)</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-foreground/85">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-border/70 bg-secondary/20 px-5 py-2 text-center text-xs text-muted-foreground">
        <span className="font-semibold">{channel.name}</span> — {channel.memberCount} members
      </div>

      {/* Composer */}
      <div className="border-t border-border/70 px-4 py-3">
        <div className="rounded-2xl border border-border/70 bg-secondary/20 p-2">
          <div className="mb-2 flex gap-1 border-b border-border/40 px-2 pb-2">
            {["B", "I", "U", "S"].map((fmt) => (
              <button
                key={fmt}
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-2">
            <input
              type="text"
              placeholder={`Message #${channel.name}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                draft.trim()
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "text-muted-foreground/40"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Member Panel Helpers                                               */
/* ------------------------------------------------------------------ */

const StatusDot = ({ status }: { status: string }) => (
  <span
    className={cn(
      "h-2.5 w-2.5 rounded-full border-2 border-white",
      status === "online"
        ? "bg-green-400"
        : status === "idle"
          ? "bg-yellow-400"
          : "bg-gray-300"
    )}
  />
);

const RoleIcon = ({ role }: { role: string }) =>
  role === "admin" ? (
    <Crown className="h-3 w-3 text-amber-500" />
  ) : role === "moderator" ? (
    <Shield className="h-3 w-3 text-blue-500" />
  ) : null;

const MemberGroup = ({
  label,
  list,
}: {
  label: string;
  list: ChannelMember[];
}) =>
  list.length > 0 ? (
    <div>
      <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label} — {list.length}
      </p>
      <div className="space-y-0.5">
        {list.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-secondary/45"
          >
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-secondary/45 text-xs font-bold uppercase text-muted-foreground">
                {m.name[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5">
                <StatusDot status={m.status} />
              </div>
            </div>
            <span className="flex-1 truncate text-sm text-foreground">
              {m.name}
            </span>
            <RoleIcon role={m.role} />
          </div>
        ))}
      </div>
    </div>
  ) : null;

/* ------------------------------------------------------------------ */
/*  Member Panel                                                       */
/* ------------------------------------------------------------------ */

function MemberPanel({ channelId }: { channelId: string }) {
  const members = channelMembers[channelId] ?? [];
  const online = members.filter((m) => m.status === "online");
  const idle = members.filter((m) => m.status === "idle");
  const offline = members.filter((m) => m.status === "offline");

  return (
    <div className="flex h-full flex-col border-l border-border/70 bg-white">
      <div className="border-b border-border/70 px-4 py-4">
        <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Members
        </h3>
        <p className="mt-1 text-xs text-muted-foreground/60">
          {members.length} in this channel
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-3">
        <MemberGroup label="Online" list={online} />
        <MemberGroup label="Idle" list={idle} />
        <MemberGroup label="Offline" list={offline} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Layout                                                        */
/* ------------------------------------------------------------------ */

export function PublicRoomsView() {
  const user = useAuthStore((state) => state.user);
  const [activeChannelId, setActiveChannelId] = useState("os");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const currentUser = user?.name || "StudySync User";

  const prevChannelRef = useRef<string | null>(null);
  const activeChannel = publicChannels.find((c) => c.id === activeChannelId)!;

  // ── Socket lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onHistory = (history: LiveMessage[]) => {
      setMessages(history);
      setLoading(false);
    };

    const onMessage = (msg: LiveMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onError = (err: { error: string }) => {
      console.error("Socket message error:", err.error);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat_history", onHistory);
    socket.on("receive_message", onMessage);
    socket.on("message_error", onError);

    if (!socket.connected) {
      socket.connect();
    } else {
      // Defer to avoid synchronous setState in effect
      queueMicrotask(() => {
        setConnected(true);
      });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_history", onHistory);
      socket.off("receive_message", onMessage);
      socket.off("message_error", onError);
    };
  }, []);

  // ── Channel switching ───────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!connected) return;

    // Leave previous channel
    if (prevChannelRef.current && prevChannelRef.current !== activeChannelId) {
      socket.emit("leave_room", prevChannelRef.current);
    }

    // Join new channel
    // Defer state updates to avoid synchronous setState warning
    queueMicrotask(() => {
      setLoading(true);
      setMessages([]);
    });
    
    socket.emit("join_room", activeChannelId);
    prevChannelRef.current = activeChannelId;
  }, [activeChannelId, connected]);

  // ── Send message ────────────────────────────────────────────────────
  const handleSend = useCallback(
    (content: string) => {
      const socket = getSocket();
      if (!socket.connected) return;

      socket.emit("send_message", {
        channelId: activeChannelId,
        senderName: currentUser,
        content,
        type: "text",
      });
    },
    [activeChannelId, currentUser]
  );

  return (
    <div className="flex h-[calc(100vh-14rem)] overflow-hidden rounded-[1.45rem] border border-border/70 shadow-[0_20px_50px_rgba(19,19,19,0.06)]">
      {/* Channel sidebar */}
      <div className="hidden w-[260px] shrink-0 lg:block">
        <ChannelSidebar
          activeChannelId={activeChannelId}
          onSelect={setActiveChannelId}
          connected={connected}
        />
      </div>

      {/* Message area */}
      <div className="min-w-0 flex-1">
        <MessageArea
          channel={activeChannel}
          messages={messages}
          loading={loading}
          onSend={handleSend}
          currentUser={currentUser}
        />
      </div>

      {/* Member panel */}
      <div className="hidden w-[240px] shrink-0 xl:block">
        <MemberPanel channelId={activeChannelId} />
      </div>
    </div>
  );
}

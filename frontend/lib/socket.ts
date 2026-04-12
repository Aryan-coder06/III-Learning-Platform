import { io, Socket } from "socket.io-client";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "").replace(/\/api$/, "");
}

function resolveSocketUrl() {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return normalizeBase(explicit);

  const nodeApi = process.env.NEXT_PUBLIC_NODE_API_URL;
  if (nodeApi) return normalizeBase(nodeApi);

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  return "";
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = resolveSocketUrl();
    if (!socketUrl) {
      throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
    }
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 20,
      timeout: 15000,
    });
  }
  return socket;
}

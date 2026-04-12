import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    if (!SOCKET_URL) {
      throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
    }
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

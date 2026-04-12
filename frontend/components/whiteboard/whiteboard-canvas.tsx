"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Paintbrush, RotateCcw, Download, Users, DoorOpen, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type DrawMode = "pencil" | "eraser";

interface Point {
  x: number;
  y: number;
}

interface DrawData {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  brushSize: number;
  mode: DrawMode;
}

const COLORS = [
  "#131313", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
];

const BRUSH_SIZES = [2, 4, 8, 14];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const prevPointRef = useRef<Point | null>(null);

  const [mode, setMode] = useState<DrawMode>("pencil");
  const [color, setColor] = useState("#131313");
  const [brushSize, setBrushSize] = useState(4);
  const [roomId, setRoomId] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  /* ---- drawing helper (both local and remote) ---- */
  const drawOnCanvas = useCallback((data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { prevPoint, currentPoint, color, brushSize, mode } = data;

    ctx.strokeStyle = mode === "pencil" ? color : "#ffffff";
    ctx.lineWidth = mode === "pencil" ? brushSize : brushSize * 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation =
      mode === "eraser" ? "destination-out" : "source-over";

    ctx.beginPath();
    if (prevPoint) {
      ctx.moveTo(prevPoint.x, prevPoint.y);
    } else {
      ctx.moveTo(currentPoint.x, currentPoint.y);
    }
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    // Reset composite mode
    ctx.globalCompositeOperation = "source-over";
  }, []);

  /* ---- clear canvas locally ---- */
  const clearLocalCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ---- socket management ---- */
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.on("whiteboard:draw", (data: DrawData) => {
      drawOnCanvas(data);
    });

    socket.on("whiteboard:clear", () => {
      clearLocalCanvas();
    });

    return () => {
      socket.off("whiteboard:draw");
      socket.off("whiteboard:clear");
    };
  }, [drawOnCanvas, clearLocalCanvas]);

  const joinRoom = useCallback(() => {
    if (!roomId.trim()) return;
    const socket = getSocket();
    
    // If already in a room, leave it
    if (currentRoom) {
      socket.emit("leave_room", { roomId: currentRoom });
    }

    // Join the whiteboard specific namespace room
    socket.emit("whiteboard:join", { roomId });
    setCurrentRoom(roomId);
    setIsJoined(true);
  }, [roomId, currentRoom]);

  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      const socket = getSocket();
      socket.emit("leave_room", { roomId: currentRoom });
      setCurrentRoom(null);
      setIsJoined(false);
    }
  }, [currentRoom]);

  /* ---- resize canvas to fill container ---- */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Save current drawing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx?.drawImage(canvas, 0, 0);

    // Resize
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill white background
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Restore saved drawing
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  /* ---- drawing handlers ---- */
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      isDrawingRef.current = true;
      prevPointRef.current = { x, y };

      // We emit the first point as well
      const data: DrawData = {
        prevPoint: null,
        currentPoint: { x, y },
        color,
        brushSize,
        mode,
      };
      
      drawOnCanvas(data);
      if (isJoined) {
        getSocket().emit("whiteboard:draw", { roomId: currentRoom, data });
      }
    },
    [mode, color, brushSize, isJoined, currentRoom, drawOnCanvas],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const currentPoint = { x, y };
      const data: DrawData = {
        prevPoint: prevPointRef.current,
        currentPoint,
        color,
        brushSize,
        mode,
      };

      drawOnCanvas(data);
      if (isJoined) {
        getSocket().emit("whiteboard:draw", { roomId: currentRoom, data });
      }

      prevPointRef.current = currentPoint;
    },
    [mode, color, brushSize, isJoined, currentRoom, drawOnCanvas],
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    prevPointRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    clearLocalCanvas();
    if (isJoined) {
      getSocket().emit("whiteboard:clear", { roomId: currentRoom });
    }
  }, [isJoined, currentRoom, clearLocalCanvas]);

  /* ---- download canvas ---- */
  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${currentRoom || "local"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [currentRoom]);

  return (
    <div className="flex flex-col gap-3">
      {/* ---- Room Controls ---- */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2 px-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Room:</span>
        </div>

        {isJoined ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              {currentRoom}
            </div>
            <button
              onClick={leaveRoom}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-50"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              Leave Room
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter room number..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-8 w-40 rounded-lg border border-gray-200 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              <LogIn className="h-3.5 w-3.5" />
              Join
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className={cn("h-1.5 w-1.5 rounded-full", isJoined ? "bg-green-500" : "bg-gray-300")} />
          {isJoined ? "Connected & Collaborative" : "Local Mode (Not Connected)"}
        </div>
      </div>

      {/* ---- Toolbar ---- */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-white p-2.5 shadow-sm">
        {/* Mode toggle */}
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            type="button"
            onClick={() => setMode("pencil")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              mode === "pencil"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Paintbrush className="h-3.5 w-3.5" />
            Pencil
          </button>
          <button
            type="button"
            onClick={() => setMode("eraser")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              mode === "eraser"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Eraser className="h-3.5 w-3.5" />
            Eraser
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Color swatches */}
        {mode === "pencil" && (
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                  color === c
                    ? "border-gray-800 scale-110 shadow-md"
                    : "border-transparent",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {mode === "pencil" && <div className="h-6 w-px bg-gray-200" />}

        {/* Brush size */}
        <div className="flex items-center gap-1.5">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBrushSize(size)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                brushSize === size
                  ? "bg-gray-800 shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "rounded-full",
                  brushSize === size ? "bg-white" : "bg-gray-500",
                )}
                style={{
                  width: `${Math.max(size, 3)}px`,
                  height: `${Math.max(size, 3)}px`,
                }}
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Actions */}
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </button>
        <button
          type="button"
          onClick={downloadCanvas}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-500"
        >
          <Download className="h-3.5 w-3.5" />
          Save
        </button>
      </div>

      {/* ---- Canvas area ---- */}
      <div
        ref={containerRef}
        className="relative min-h-[600px] w-full overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Paintbrush, RotateCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type DrawMode = "pencil" | "eraser";

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

  const [mode, setMode] = useState<DrawMode>("pencil");
  const [color, setColor] = useState("#131313");
  const [brushSize, setBrushSize] = useState(4);

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
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.strokeStyle = mode === "pencil" ? color : "#ffffff";
      ctx.lineWidth = mode === "pencil" ? brushSize : brushSize * 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation =
        mode === "eraser" ? "destination-out" : "source-over";

      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawingRef.current = true;
    },
    [mode, color, brushSize],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [],
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.closePath();
    // Reset composite mode after erasing
    if (ctx) ctx.globalCompositeOperation = "source-over";
  }, []);

  /* ---- clear canvas ---- */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ---- download canvas ---- */
  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <div className="flex flex-col gap-3">
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
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
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
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
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
        className="relative min-h-[500px] w-full overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm"
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

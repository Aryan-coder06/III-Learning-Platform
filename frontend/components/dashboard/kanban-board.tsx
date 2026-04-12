"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical, LoaderCircle, Plus, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type ColumnId = "todo" | "in-progress" | "done";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

interface KanbanColumn {
  id: ColumnId;
  label: string;
  headerBg: string;
  headerText: string;
  dotColor: string;
  stripColor: string;
  dropHighlight: string;
}

const COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    label: "To Do",
    headerBg: "bg-orange-500",
    headerText: "text-white",
    dotColor: "bg-orange-400",
    stripColor: "bg-orange-500",
    dropHighlight: "ring-orange-400/50 bg-orange-50/40",
  },
  {
    id: "in-progress",
    label: "In Progress",
    headerBg: "bg-amber-500",
    headerText: "text-white",
    dotColor: "bg-amber-400",
    stripColor: "bg-amber-500",
    dropHighlight: "ring-amber-400/50 bg-amber-50/40",
  },
  {
    id: "done",
    label: "Done",
    headerBg: "bg-emerald-500",
    headerText: "text-white",
    dotColor: "bg-emerald-400",
    stripColor: "bg-emerald-500",
    dropHighlight: "ring-emerald-400/50 bg-emerald-50/40",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Record<ColumnId, KanbanTask[]>>({
    todo: [],
    "in-progress": [],
    done: [],
  });

  /* ---- AI prompt state ---- */
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiInputRef = useRef<HTMLInputElement | null>(null);

  /* ---- expanded tasks state ---- */
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  /* ---- add-task form state per column ---- */
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);

  /* ---- drag state ---- */
  const dragItem = useRef<{ columnId: ColumnId; taskId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  /* ---- helpers ---- */
  const addTask = useCallback(
    (columnId: ColumnId, title: string, description: string) => {
      if (!title.trim()) return;
      setTasks((prev) => ({
        ...prev,
        [columnId]: [
          ...prev[columnId],
          {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            createdAt: Date.now(),
          },
        ],
      }));
    },
    [],
  );

  const removeTask = useCallback((columnId: ColumnId, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((t) => t.id !== taskId),
    }));
  }, []);

  const moveTask = useCallback(
    (fromColumn: ColumnId, toColumn: ColumnId, taskId: string) => {
      if (fromColumn === toColumn) return;
      setTasks((prev) => {
        const task = prev[fromColumn].find((t) => t.id === taskId);
        if (!task) return prev;
        return {
          ...prev,
          [fromColumn]: prev[fromColumn].filter((t) => t.id !== taskId),
          [toColumn]: [...prev[toColumn], task],
        };
      });
    },
    [],
  );

  /* ---- AI generate handler ---- */
  const handleAiGenerate = useCallback(async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate tasks.");
      }

      const data = await response.json();
      const generated: Array<{
        column: ColumnId;
        title: string;
        description: string;
      }> = data.tasks ?? [];

      if (generated.length === 0) {
        setAiError("No tasks were generated. Try rephrasing your request.");
        return;
      }

      // Push generated tasks into the board
      setTasks((prev) => {
        const next = { ...prev };
        for (const col of COLUMNS) {
          next[col.id] = [...prev[col.id]];
        }
        for (const item of generated) {
          next[item.column].push({
            id: crypto.randomUUID(),
            title: item.title,
            description: item.description,
            createdAt: Date.now(),
          });
        }
        return next;
      });

      setAiPrompt("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  /* ---- drag handlers ---- */
  const handleDragStart = (columnId: ColumnId, taskId: string) => {
    dragItem.current = { columnId, taskId };
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, toColumn: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (dragItem.current) {
      moveTask(dragItem.current.columnId, toColumn, dragItem.current.taskId);
      dragItem.current = null;
    }
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDragOverColumn(null);
  };

  /* ---- inline add form ---- */
  const openAdd = (columnId: ColumnId) => {
    setAddingTo(columnId);
    setNewTitle("");
    setNewDesc("");
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const commitAdd = () => {
    if (addingTo && newTitle.trim()) {
      addTask(addingTo, newTitle, newDesc);
    }
    setAddingTo(null);
    setNewTitle("");
    setNewDesc("");
  };

  const cancelAdd = () => {
    setAddingTo(null);
    setNewTitle("");
    setNewDesc("");
  };

  /* ---- render ---- */
  return (
    <div className="space-y-5">
      {/* ---- AI Prompt Bar ---- */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-sidebar via-sidebar to-sidebar/90 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">AI Task Generator</p>
            <p className="text-xs text-sidebar-foreground/50">Describe your work and let AI break it into tasks</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            ref={aiInputRef}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !aiLoading) {
                e.preventDefault();
                void handleAiGenerate();
              }
            }}
            disabled={aiLoading}
            placeholder="e.g. I need to prepare for my data structures exam next week..."
            className="flex-1 h-11 rounded-xl bg-sidebar-foreground/[0.06] border-sidebar-foreground/10 text-sidebar-foreground text-sm placeholder:text-sidebar-foreground/30 focus:border-accent/50 focus:ring-accent/20"
          />
          <Button
            variant="accent"
            className="h-11 rounded-xl px-5 text-[0.68rem]"
            onClick={() => void handleAiGenerate()}
            disabled={aiLoading || !aiPrompt.trim()}
          >
            {aiLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Tasks
              </>
            )}
          </Button>
        </div>

        {aiError && (
          <p className="mt-2 text-xs text-red-400">{aiError}</p>
        )}
      </div>

      {/* ---- Kanban Columns ---- */}
      <div className="grid gap-5 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = tasks[col.id];
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={cn(
                "flex flex-col rounded-2xl bg-[#f4f5f7] transition-all duration-200 min-h-[320px]",
                isOver && `ring-2 ${col.dropHighlight}`,
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* ---- Column header banner ---- */}
              <div className={cn("mx-3 mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between", col.headerBg)}>
                <div className="flex items-center gap-2.5">
                  <span className={cn("text-[0.7rem] font-bold uppercase tracking-[0.16em]", col.headerText)}>
                    {col.label}
                  </span>
                  <span className={cn(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[0.65rem] font-bold",
                    col.headerText,
                  )}>
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openAdd(col.id)}
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors bg-white/20 hover:bg-white/40",
                    col.headerText,
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* ---- Tasks list ---- */}
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                {columnTasks.map((task) => {
                  const isExpanded = expandedTasks.has(task.id);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(col.id, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => toggleExpand(task.id)}
                      className={cn(
                        "group relative cursor-grab overflow-hidden rounded-xl border border-white/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-150",
                        "hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5",
                        "active:cursor-grabbing active:shadow-lg active:scale-[1.01]",
                      )}
                    >
                      {/* Left color strip */}
                      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", col.stripColor)} />

                      <div className="flex items-start gap-2 pl-2">
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-400" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-5">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className={cn(
                              "mt-1 text-xs leading-5 text-gray-400 transition-all duration-200",
                              !isExpanded && "line-clamp-2",
                            )}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Accent dot + delete */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className={cn("h-3 w-3 rounded-full", col.dotColor)} />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTask(col.id, task.id); }}
                            className="rounded-full p-1 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {columnTasks.length === 0 && addingTo !== col.id && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gray-200/80 py-10">
                    <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Drop tasks here
                    </p>
                  </div>
                )}

                {/* Inline add form */}
                {addingTo === col.id && (
                  <div className="rounded-xl border-2 border-dashed border-gray-300/60 bg-white p-3.5 shadow-sm">
                    <Input
                      ref={titleRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) commitAdd();
                        if (e.key === "Escape") cancelAdd();
                      }}
                      placeholder="Task title"
                      className="mb-2 h-9 rounded-lg border-gray-200 bg-gray-50/60 text-sm font-medium placeholder:text-gray-300"
                    />
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") cancelAdd();
                      }}
                      placeholder="Description (optional)"
                      rows={2}
                      className="mb-3 resize-none rounded-lg border-gray-200 bg-gray-50/60 text-xs placeholder:text-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="dark"
                        className="h-8 rounded-lg px-4 text-[0.65rem]"
                        onClick={commitAdd}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Task
                      </Button>
                      <button
                        type="button"
                        onClick={cancelAdd}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

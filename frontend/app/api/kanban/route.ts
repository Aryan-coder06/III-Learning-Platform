import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a task-planning assistant. The user will describe work they need to do.
Break it down into actionable tasks and assign each to ONE of these kanban columns:
- "todo" — tasks not yet started
- "in-progress" — tasks the user is currently working on
- "done" — tasks already completed (only if the user explicitly says so)

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences.
Each element must have exactly these fields:
{
  "column": "todo" | "in-progress" | "done",
  "title": "short task title",
  "description": "1-2 sentence description of what needs to be done"
}

Example:
[{"column":"todo","title":"Read Chapter 5","description":"Read and take notes on Chapter 5 of the textbook covering linked lists."},{"column":"todo","title":"Solve practice problems","description":"Complete the 10 practice problems at the end of Chapter 5."}]`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Gemini API request failed." },
        { status: 502 },
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract the text from Gemini response
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse the JSON array
    let tasks: Array<{
      column: string;
      title: string;
      description: string;
    }>;

    try {
      tasks = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini output as JSON:", rawText);
      return NextResponse.json(
        { error: "Gemini returned invalid JSON.", raw: rawText },
        { status: 502 },
      );
    }

    // Validate and sanitize
    const validColumns = new Set(["todo", "in-progress", "done"]);
    const sanitized = tasks
      .filter(
        (t) =>
          t &&
          typeof t.title === "string" &&
          typeof t.column === "string" &&
          validColumns.has(t.column),
      )
      .map((t) => ({
        column: t.column as "todo" | "in-progress" | "done",
        title: t.title.trim(),
        description: (t.description ?? "").trim(),
      }));

    return NextResponse.json({ tasks: sanitized });
  } catch (error) {
    console.error("Kanban generate error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

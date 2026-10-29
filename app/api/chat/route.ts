import { NextResponse } from "next/server";
import { getUsageDatabase } from "@/lib/usage-history-db";

export const runtime = "nodejs";

const ALLOWED_MODELS = new Set([
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
]);

type ChatMessage = { role: "user" | "assistant"; content: string };

function validSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
  }

  const input = body as { model?: unknown; messages?: unknown; sessionId?: unknown };
  if (typeof input.model !== "string" || !ALLOWED_MODELS.has(input.model)) {
    return NextResponse.json({ error: "Choose a supported model from the selector." }, { status: 400 });
  }
  if (!Array.isArray(input.messages) || input.messages.length < 1 || input.messages.length > 30) {
    return NextResponse.json({ error: "Send between 1 and 30 messages." }, { status: 400 });
  }
  const messages: ChatMessage[] = [];
  for (const item of input.messages) {
    if (
      !item || typeof item !== "object" ||
      !("role" in item) || !("content" in item) ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      item.content.trim().length === 0 ||
      item.content.length > 12000
    ) {
      return NextResponse.json({ error: "Each message must have a valid role and non-empty content under 12,000 characters." }, { status: 400 });
    }
    messages.push({ role: item.role, content: item.content });
  }

  if (messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "The final message must be a user prompt." }, { status: 400 });
  }
  if (!validSessionId(input.sessionId)) {
    return NextResponse.json({ error: "A valid browser session is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The server is missing OPENROUTER_API_KEY. Add it to the deployment environment." }, { status: 503 });
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://theaisignal.vercel.app",
        "X-Title": "The AI Signal Playground",
      },
      body: JSON.stringify({ model: input.model, messages, stream: false, max_tokens: 2048 }),
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the AI provider. Please try again." }, { status: 502 });
  }

  const payload = await providerResponse.json().catch(() => null) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    usage?: { total_tokens?: number };
    error?: { message?: string };
  } | null;

  if (!providerResponse.ok) {
    const status = providerResponse.status === 429 ? 429 : providerResponse.status >= 500 ? 502 : 400;
    return NextResponse.json(
      { error: payload?.error?.message || "The AI provider rejected this request." },
      { status },
    );
  }

  const responseText = payload?.choices?.[0]?.message?.content;
  if (typeof responseText !== "string") {
    return NextResponse.json({ error: "The AI provider returned an empty or unsupported response." }, { status: 502 });
  }

  const prompt = [...messages].reverse().find((message) => message.role === "user")?.content || "";
  const tokensUsed = Number.isFinite(payload?.usage?.total_tokens) ? payload!.usage!.total_tokens! : null;
  // History is best-effort: a storage issue must not discard a successful model response.
  let historySaved = false;
  try {
    const db = getUsageDatabase();
    const result = db.prepare(
      "INSERT INTO usage_history (session_id, model, prompt, response, tokens_used) VALUES (?, ?, ?, ?, ?)",
    ).run(input.sessionId, input.model, prompt, responseText, tokensUsed);
    historySaved = Number(result.changes) === 1;
  } catch (error) {
    console.error("Usage history save failed:", error instanceof Error ? error.message : "Unknown database error");
  }

  return NextResponse.json({ response: responseText, model: input.model, tokensUsed, historySaved });
}

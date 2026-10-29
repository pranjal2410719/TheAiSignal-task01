/**
 * Secure AI Chat Execution API Route with rate limiting & session logging.
 * @author Pranjal Yadav <https://github.com/pranjal2410719>
 */

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

// In-memory sliding-window rate limiter (15 requests per minute per session)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
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
  if (!Array.isArray(input.messages) || input.messages.length < 1) {
    return NextResponse.json({ error: "Send at least one message." }, { status: 400 });
  }
  if (!validSessionId(input.sessionId)) {
    return NextResponse.json({ error: "A valid browser session is required." }, { status: 400 });
  }

  // Rate limit protection
  if (!checkRateLimit(input.sessionId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded (max 15 prompts/min). Please wait a few seconds before trying again." },
      { status: 429 }
    );
  }

  // Auto-window up to 30 messages to avoid hard 400 errors during long sessions
  const rawList = input.messages.length > 30 ? input.messages.slice(-30) : input.messages;
  const messages: ChatMessage[] = [];
  for (const item of rawList) {
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
    const message = payload?.error?.message;
    if (providerResponse.status === 429) {
      return NextResponse.json({ error: "OpenRouter rate limit reached. Please wait a moment." }, { status: 429 });
    }
    return NextResponse.json(
      { error: typeof message === "string" ? message : "The AI model could not process your prompt." },
      { status: 502 }
    );
  }

  const reply = payload?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || reply.trim().length === 0) {
    return NextResponse.json({ error: "The provider returned an empty response." }, { status: 502 });
  }

  const totalTokens = typeof payload?.usage?.total_tokens === "number" ? payload.usage.total_tokens : null;
  const userPrompt = messages[messages.length - 1].content;

  let historySaved = false;
  try {
    const db = getUsageDatabase();
    if (db) {
      const statement = db.prepare(`
        INSERT INTO usage_history (session_id, model, prompt, response, total_tokens)
        VALUES (?, ?, ?, ?, ?)
      `);
      statement.run(input.sessionId, input.model, userPrompt, reply, totalTokens);
      historySaved = true;
    }
  } catch (error) {
    console.error("Usage history write failed:", error);
  }

  return NextResponse.json({ response: reply, tokensUsed: totalTokens, historySaved });
}

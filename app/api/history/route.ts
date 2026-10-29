import { NextResponse } from "next/server";
import { getUsageDatabase } from "@/lib/usage-history-db";

export const runtime = "nodejs";

function validSessionId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!validSessionId(sessionId)) {
    return NextResponse.json({ error: "A valid browser session is required." }, { status: 400 });
  }

  try {
    const db = getUsageDatabase();
    const items = db.prepare(
      "SELECT id, model, prompt, response, tokens_used, created_at FROM usage_history WHERE session_id = ? ORDER BY created_at DESC, id DESC LIMIT 50",
    ).all(sessionId);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The database could not be reached.";
    const status = message.includes("Vercel") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

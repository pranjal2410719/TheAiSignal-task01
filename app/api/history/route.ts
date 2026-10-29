import { NextResponse } from "next/server";

export const runtime = "nodejs";

function validSessionId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!validSessionId(sessionId)) {
    return NextResponse.json({ error: "A valid browser session is required." }, { status: 400 });
  }

  const databaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!databaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Usage history is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  }

  try {
    const response = await fetch(
      `${databaseUrl}/rest/v1/usage_history?select=id,model,prompt,response,tokens_used,created_at&session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) {
      return NextResponse.json({ error: "Could not load usage history. Check the database table setup." }, { status: 502 });
    }
    return NextResponse.json({ items: await response.json() });
  } catch {
    return NextResponse.json({ error: "The database could not be reached." }, { status: 502 });
  }
}

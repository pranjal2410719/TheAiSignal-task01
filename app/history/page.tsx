"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, RefreshCw } from "lucide-react";

type HistoryItem = { id: string; model: string; prompt: string; response: string; tokens_used: number | null; created_at: string };

function getSessionId() {
  const key = "the-ai-signal-session-id";
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = window.crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/history?sessionId=${encodeURIComponent(getSessionId())}`, { cache: "no-store" });
      const data = await response.json() as { items?: HistoryItem[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load history.");
      setItems(data.items || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <Link href="/playground" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface hover:bg-sunken" aria-label="Back to playground"><ArrowLeft size={17} /></Link>
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">The AI Signal</p><h1 className="serif text-2xl font-semibold sm:text-3xl">Usage history</h1></div>
          </div>
          <div className="flex gap-2"><Link href="/playground" className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-sunken">Playground</Link><button type="button" onClick={() => { setLoading(true); setError(""); void loadHistory(); }} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm text-on-ink disabled:opacity-50"><RefreshCw size={14} /> Refresh</button></div>
        </header>

        <div className="py-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Recent requests</h2><p className="mt-1 text-sm text-muted">Up to 50 saved requests from this browser session.</p></div><span className="text-xs text-muted">{items.length} records</span></div>
          {loading && <p className="py-12 text-center text-sm text-muted">Loading saved requests…</p>}
          {!loading && error && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">History unavailable</p><p className="mt-1">{error}</p><p className="mt-2 text-xs">Check the environment variables and run the SQL setup in supabase/usage_history.sql.</p></div>}
          {!loading && !error && items.length === 0 && <div className="rounded-2xl border border-line bg-surface p-10 text-center"><Clock3 size={24} className="mx-auto text-muted" /><h3 className="mt-3 font-semibold">No saved requests yet</h3><p className="mt-1 text-sm text-muted">Send a prompt in the playground to create your first history record.</p><Link href="/playground" className="mt-4 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-on-ink">Open playground</Link></div>}
          <div className="space-y-4">
            {items.map((item) => <article key={item.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3"><span className="max-w-full break-all rounded-md bg-sunken px-2 py-1 text-xs font-medium">{item.model}</span><time className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</time></div>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Prompt</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{item.prompt}</p>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Response</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{item.response}</p>
              <p className="mt-4 text-xs text-muted">Tokens used: {item.tokens_used ?? "Not reported"}</p>
            </article>)}
          </div>
        </div>
      </div>
    </main>
  );
}

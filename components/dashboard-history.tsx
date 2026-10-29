"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, RefreshCw } from "lucide-react";

type HistoryItem = {
  id: string;
  model: string;
  prompt: string;
  response: string;
  tokens_used: number | null;
  created_at: string;
};

function getSessionId() {
  if (typeof window === "undefined") return "00000000-0000-4000-8000-000000000000";
  const key = "the-ai-signal-session-id";
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = window.crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

interface DashboardHistoryProps {
  onBackToPlayground?: () => void;
}

export function DashboardHistory({ onBackToPlayground }: DashboardHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    const response = await fetch(`/api/history?sessionId=${encodeURIComponent(getSessionId())}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as { items?: HistoryItem[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Could not load history.");
    return data.items || [];
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setItems(await fetchHistory());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  useEffect(() => {
    let cancelled = false;
    fetchHistory()
      .then((history) => {
        if (!cancelled) setItems(history);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchHistory]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted">DATABASE LOGS</p>
          <h2 className="serif text-2xl font-medium text-ink">Request & Usage History</h2>
          <p className="text-xs text-muted mt-1">
            Persisted prompts, completions, and token metrics retrieved from the server SQLite store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onBackToPlayground && (
            <button
              type="button"
              onClick={onBackToPlayground}
              className="btn btn-line text-xs py-1.5 px-3 h-9"
            >
              <ArrowLeft size={14} />
              <span>Back to Playground</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              void loadHistory();
            }}
            disabled={loading}
            className="btn btn-ink text-xs py-1.5 px-3 h-9 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-sm text-muted rounded-2xl border border-line bg-surface">
          Loading saved requests from database…
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold text-sm">History unavailable</p>
          <p className="mt-1">{error}</p>
          <p className="mt-1 text-[11px] opacity-80">
            Local SQLite history is active on Node.js 22+. On ephemeral serverless deploys, local files are memory-bound.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <Clock3 size={28} className="mx-auto text-muted mb-3" />
          <h3 className="serif text-lg font-medium text-ink">No saved requests yet</h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            Run a prompt in the AI Playground to generate your first tracked request and token log.
          </p>
          {onBackToPlayground && (
            <button
              type="button"
              onClick={onBackToPlayground}
              className="btn btn-ink text-xs py-2 px-4 mt-4"
            >
              Open AI Playground
            </button>
          )}
        </div>
      )}

      {/* Items list */}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="p-5 rounded-2xl border border-line bg-surface space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
              <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-sunken text-ink">
                {item.model}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted">
                {item.tokens_used !== null && (
                  <span className="mono font-semibold text-accent">
                    {item.tokens_used} tokens
                  </span>
                )}
                <time>{new Date(item.created_at).toLocaleString()}</time>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Prompt</span>
              <p className="text-xs text-ink whitespace-pre-wrap break-words mt-1 leading-relaxed bg-sunken/40 p-3 rounded-lg border border-line">
                {item.prompt}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Response</span>
              <p className="text-xs text-ink whitespace-pre-wrap break-words mt-1 leading-relaxed">
                {item.response}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

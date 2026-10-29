"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Check, Clock3, Copy, LoaderCircle, MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";

export const PLAYGROUND_MODELS = [
  { id: "openrouter/free", label: "Auto-select available free model", lab: "Auto" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B · Free", lab: "Meta" },
  { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek Chat · Free", lab: "DeepSeek" },
] as const;

type Message = { role: "user" | "assistant"; content: string; timestamp?: string };

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

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer border border-transparent hover:border-line"
      title="Copy full response"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-500" />
          <span className="text-emerald-500 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

interface DashboardPlaygroundProps {
  onOpenHistory?: () => void;
  selectedModelId?: string;
}

export function DashboardPlayground({ onOpenHistory, selectedModelId }: DashboardPlaygroundProps) {
  const [model, setModel] = useState<string>(() => {
    if (selectedModelId) {
      const match = PLAYGROUND_MODELS.find((m) => m.id === selectedModelId);
      if (match) return match.id;
    }
    return "openrouter/free";
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [prevSelectedId, setPrevSelectedId] = useState(selectedModelId);
  if (selectedModelId !== prevSelectedId) {
    setPrevSelectedId(selectedModelId);
    if (selectedModelId) {
      const match = PLAYGROUND_MODELS.find((m) => m.id === selectedModelId);
      if (match) {
        setModel(match.id);
      }
    }
  }

  const activeModel = useMemo(() => PLAYGROUND_MODELS.find((item) => item.id === model) ?? PLAYGROUND_MODELS[0], [model]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const sendMessage = useCallback(async () => {
    const content = draft.trim();
    if (!content || busy) return;
    if (content.length > 12000) {
      setError("Keep each message under 12,000 characters.");
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nextMessages: Message[] = [...messages, { role: "user", content, timestamp }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");
    setNotice("");

    // Sliding window: send up to last 16 messages to stay comfortably below the server's message limit
    const payloadMessages = nextMessages.length > 16 ? nextMessages.slice(-16) : nextMessages;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: payloadMessages.map(({ role, content: msgContent }) => ({ role, content: msgContent })),
          sessionId: getSessionId(),
        }),
      });
      const data = (await response.json()) as {
        response?: string;
        error?: string;
        tokensUsed?: number | null;
        historySaved?: boolean;
      };
      if (!response.ok || !data.response) throw new Error(data.error || "The request failed.");
      
      const assistantTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((current) => [...current, { role: "assistant", content: data.response!, timestamp: assistantTimestamp }]);
      setNotice(
        data.historySaved
          ? `Saved to history · ${data.tokensUsed ?? "—"} tokens`
          : "Response received · history is not configured yet"
      );
    } catch (cause) {
      setMessages((current) =>
        current.filter(
          (message, index) => !(index === current.length - 1 && message.role === "user" && message.content === content)
        )
      );
      setDraft(content);
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }, [busy, draft, messages, model]);

  const clearConversation = () => {
    if (busy) return;
    setMessages([]);
    setDraft("");
    setError("");
    setNotice("");
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted">LIVE TESTING</p>
          <h2 className="serif text-2xl font-medium text-ink">AI Model Playground</h2>
          <p className="text-xs text-muted mt-1">
            Submit prompts, compare responses, and test live LLM behavior with zero frontend API key exposure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="btn btn-line text-xs py-1.5 px-3 h-9"
            >
              <Clock3 size={14} />
              <span>View History</span>
            </button>
          )}
          <button
            type="button"
            onClick={clearConversation}
            disabled={busy || messages.length === 0}
            className="btn btn-line text-xs py-1.5 px-3 h-9 text-muted hover:text-red-500 disabled:opacity-40"
          >
            <Trash2 size={14} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        {/* Chat Conversation Card */}
        <div className="flex flex-col min-h-[580px] max-h-[750px] rounded-2xl border border-line bg-surface overflow-hidden">
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-line bg-surface">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunken text-accent">
                <Bot size={17} />
              </span>
              <div>
                <span className="text-xs font-semibold text-ink block">{activeModel.label}</span>
                <span className="text-[10px] text-muted font-mono">{activeModel.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 16 && (
                <span className="chip text-[10px] font-mono bg-sunken">
                  Sliding window: last 16
                </span>
              )}
              <span className="chip text-[11px] font-mono">
                {messages.length} msg{messages.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.length === 0 && (
              <div className="grid place-items-center min-h-[320px] text-center p-6">
                <div className="max-w-md">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-sunken text-accent">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="serif text-xl font-medium text-ink">What would you like to explore?</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Choose a model, type a prompt, and evaluate how the AI performs with clean, organized markdown output.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {[
                      "Explain recursion with a simple code example",
                      "Write a Python script to parse JSON safely",
                      "What is Retrieval-Augmented Generation (RAG)?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setDraft(suggestion)}
                        className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink hover:bg-sunken cursor-pointer transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sunken text-accent">
                    <Bot size={15} />
                  </div>
                )}
                
                {message.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-ink text-on-ink px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                    {message.content}
                    {message.timestamp && (
                      <span className="block mt-1 text-[10px] text-on-ink/60 text-right font-mono">
                        {message.timestamp}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl border border-line bg-canvas p-4 text-ink shadow-sm space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-line text-[11px] text-muted">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {activeModel.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {message.timestamp && (
                          <span className="text-[10px] font-mono text-muted">{message.timestamp}</span>
                        )}
                        <CopyMessageButton text={message.content} />
                      </div>
                    </div>
                    <ChatMarkdown content={message.content} />
                  </div>
                )}

                {message.role === "user" && (
                  <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sunken text-ink">
                    <MessageSquare size={14} />
                  </div>
                )}
              </article>
            ))}

            {busy && (
              <div className="flex items-center gap-2.5 text-xs text-muted py-2 pl-10">
                <LoaderCircle className="animate-spin text-accent" size={16} />
                <span>Generating refined response from {activeModel.label}…</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            className="border-t border-line p-3 sm:p-4 bg-surface"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              maxLength={12000}
              placeholder="Ask a question, enter instructions, or paste code… (Enter to send, Shift+Enter for newline)"
              className="w-full resize-none rounded-xl border border-line bg-canvas p-3 text-xs sm:text-sm text-ink outline-none focus:border-accent"
              disabled={busy}
            />
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-muted">
                {draft.length.toLocaleString()} / 12,000 characters
              </span>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="btn btn-ink text-xs py-1.5 px-4 h-8 font-semibold disabled:opacity-40"
              >
                <Send size={13} />
                <span>{busy ? "Generating…" : "Send prompt"}</span>
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
                {error}
              </p>
            )}
            {notice && <p className="mt-2 text-xs text-muted">{notice}</p>}
          </form>
        </div>

        {/* Settings & Info Sidebar */}
        <aside className="space-y-4">
          <div className="p-4 rounded-2xl border border-line bg-surface">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Model Configuration</h3>
            <label htmlFor="playground-model" className="text-xs text-muted block mb-1.5">
              Selected LLM Provider:
            </label>
            <select
              id="playground-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={busy}
              className="w-full h-10 px-3 rounded-xl border border-line bg-canvas text-xs text-ink outline-none focus:border-accent cursor-pointer"
            >
              {PLAYGROUND_MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2.5 text-[11px] text-muted leading-relaxed">
              Requests are routed through OpenRouter free tier. Server API keys are protected and never sent to client browsers.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 size={15} className="text-accent" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Session Storage</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Your prompt runs and token counts are stored in the server SQLite database linked to this browser session.
            </p>
            <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-muted">Current Turn:</span>
              <strong className="mono text-ink">{messages.length} messages</strong>
            </div>
          </div>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-sunken text-xs font-medium text-ink transition-colors cursor-pointer"
            >
              <span>View Usage History</span>
              <Check size={14} className="text-accent" />
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, Check, Clock3, LoaderCircle, MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";

const MODEL_OPTIONS = [
  { id: "openrouter/free", label: "Auto-select available free model" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B · Free (availability may vary)" },
  { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek Chat · Free" },
] as const;

type Message = { role: "user" | "assistant"; content: string };

function getSessionId() {
  const key = "the-ai-signal-session-id";
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = window.crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

export default function PlaygroundPage() {
  const [model, setModel] = useState<string>("openrouter/free");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedModel = useMemo(() => MODEL_OPTIONS.find((item) => item.id === model) ?? MODEL_OPTIONS[0], [model]);

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

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: nextMessages, sessionId: getSessionId() }),
      });
      const data = await response.json() as { response?: string; error?: string; tokensUsed?: number | null; historySaved?: boolean };
      if (!response.ok || !data.response) throw new Error(data.error || "The request failed.");
      setMessages((current) => [...current, { role: "assistant", content: data.response! }]);
      setNotice(data.historySaved ? `Saved to history · ${data.tokensUsed ?? "—"} tokens` : "Response received · history is not configured yet");
    } catch (cause) {
      setMessages((current) => current.filter((message, index) => !(index === current.length - 1 && message.role === "user" && message.content === content)));
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
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <Link href="/compare" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface hover:bg-sunken" aria-label="Back to model catalog"><ArrowLeft size={17} /></Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">The AI Signal</p>
              <h1 className="serif text-2xl font-semibold sm:text-3xl">Model Playground</h1>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-lg border border-line px-3 py-2 hover:bg-sunken" href="/compare">Model catalog</Link>
            <Link className="rounded-lg border border-line px-3 py-2 hover:bg-sunken" href="/history">Usage history</Link>
          </nav>
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="flex min-h-[65vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><Bot size={20} /></div>
                <div><h2 className="font-semibold">Conversation</h2><p className="text-xs text-muted">Prompts are sent securely through the server API.</p></div>
              </div>
              <button type="button" onClick={clearConversation} disabled={busy || messages.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-sunken"><Trash2 size={14} /> Clear conversation</button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
              {messages.length === 0 && (
                <div className="grid min-h-[330px] place-items-center text-center">
                  <div className="max-w-md">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent"><Sparkles size={25} /></div>
                    <h3 className="serif text-2xl font-semibold">What would you like to explore?</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">Choose a model, write a prompt, and compare how AI responds to your task.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {["Explain recursion with a simple example", "Give me a Python coding challenge", "Summarize the idea of RAG"].map((suggestion) => <button key={suggestion} type="button" onClick={() => setDraft(suggestion)} className="rounded-full border border-line px-3 py-2 text-xs hover:bg-sunken">{suggestion}</button>)}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <article key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Bot size={16} /></div>}
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${message.role === "user" ? "bg-ink text-on-ink" : "border border-line bg-canvas text-ink"}`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  {message.role === "user" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sunken text-ink"><MessageSquare size={16} /></div>}
                </article>
              ))}

              {busy && <div className="flex items-center gap-3 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} /><span>Waiting for {selectedModel.label}…</span></div>}
            </div>

            <form className="border-t border-line p-4 sm:p-5" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
              <label htmlFor="prompt" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">Your prompt</label>
              <textarea ref={textareaRef} id="prompt" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={3} maxLength={12000} placeholder="Ask a question, give an instruction, or paste a coding task…" className="w-full resize-y rounded-xl border border-line bg-canvas p-3 text-sm outline-none focus:border-accent" disabled={busy} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted">{draft.length.toLocaleString()} / 12,000 · Enter to send, Shift+Enter for a new line</span>
                <button type="submit" disabled={busy || !draft.trim()} className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-on-ink disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /> {busy ? "Sending…" : "Send prompt"}</button>
              </div>
              {error && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {notice && <p className="mt-3 text-xs text-muted">{notice}</p>}
            </form>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-line bg-surface p-4">
              <h2 className="mb-3 font-semibold">Model settings</h2>
              <label htmlFor="model" className="mb-2 block text-xs font-medium text-muted">Active model</label>
              <select id="model" value={model} onChange={(event) => setModel(event.target.value)} disabled={busy} className="w-full rounded-xl border border-line bg-canvas p-3 text-sm outline-none focus:border-accent">
                {MODEL_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              <p className="mt-3 break-all text-[11px] text-muted">{model}</p>
              <div className="mt-4 rounded-xl bg-sunken p-3 text-xs leading-5 text-muted">The auto-select option routes to an available free text model. Other free variants may become unavailable; all requests are subject to OpenRouter rate limits and provider availability.</div>
            </section>
            <section className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-2"><Clock3 size={16} className="text-accent" /><h2 className="font-semibold">Session</h2></div>
              <p className="mt-2 text-sm text-muted">This conversation stays in this page until you clear it or leave. Successful prompts can be saved to usage history when the database is configured.</p>
              <p className="mt-3 text-xs text-muted">{messages.length} message{messages.length === 1 ? "" : "s"} in current conversation</p>
            </section>
            <Link href="/history" className="flex items-center justify-between rounded-xl border border-line bg-surface p-4 text-sm font-medium hover:bg-sunken"><span>View saved requests</span><Check size={15} /></Link>
          </aside>
        </section>
        <footer className="border-t border-line py-4 text-xs text-muted">Never send passwords, API keys, or sensitive personal information to the playground.</footer>
      </div>
    </main>
  );
}

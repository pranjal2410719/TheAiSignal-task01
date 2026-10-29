"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import AICitations from "@/components/kokonutui/ai-citations";
import AIMessageQueue from "@/components/kokonutui/ai-message-queue";
import SwitchButton from "@/components/kokonutui/switch-button";

export default function KokonutDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] transition-colors duration-200">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-line">|</span>
          <h1 className="text-sm font-semibold tracking-tight">Kokonut UI Components Showcase</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Theme Switcher:</span>
          <SwitchButton size="default" showLabel={true} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-16">
        {/* Section 1: Switch Button */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-lg font-serif font-medium">1. Switch Button (`@kokonutui/switch-button`)</h2>
            <p className="text-xs text-muted">
              Circular-reveal smooth View Transition dark/light theme switch. Integrated into the global topbar and sidebar.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-line flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">Small:</span>
              <SwitchButton size="sm" showLabel={false} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">Default:</span>
              <SwitchButton size="default" showLabel={false} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">With Label:</span>
              <SwitchButton size="default" showLabel={true} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">Large:</span>
              <SwitchButton size="lg" showLabel={true} />
            </div>
          </div>
        </section>

        {/* Section 2: AI Prompt */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-lg font-serif font-medium">2. AI Prompt (`@kokonutui/ai-prompt`)</h2>
            <p className="text-xs text-muted">
              Feature-rich prompt composer with model selection, effort/thinking levels, file attachment chips, and slash command palette.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-line">
            <AI_Prompt
              placeholder="Ask anything, type / for commands, or drop files..."
              headerText="Claude 3.7 Sonnet thinking mode available"
              headerAction="Try now"
              promotedModel="Claude 3.7 Sonnet"
            />
          </div>
        </section>

        {/* Section 3: AI Citations */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-lg font-serif font-medium">3. AI Citations (`@kokonutui/ai-citations`)</h2>
            <p className="text-xs text-muted">
              Interactive answer with smooth animated source badges and floating preview card tooltips.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-line">
            <AICitations />
          </div>
        </section>

        {/* Section 4: AI Message Queue */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-lg font-serif font-medium">4. AI Message Queue (`@kokonutui/ai-message-queue`)</h2>
            <p className="text-xs text-muted">
              Keep typing while the AI is busy. Queue follow-up prompts, reorder them with drag-and-drop, or send immediately.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-line">
            <AIMessageQueue />
          </div>
        </section>
      </main>
    </div>
  );
}

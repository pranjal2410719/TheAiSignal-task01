"use client";

import { ArrowRight, BrainCircuit, Calculator, Cpu, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

interface HeroScreenProps {
  onLaunch: (tab?: "compare" | "estimator" | "details" | "all") => void;
}

// 12 months release distribution (Nov 25 -> Oct 26) per design.md
const MONTHLY_RELEASES = [
  { month: "Nov 25", count: 34, height: 35 },
  { month: "Dec 25", count: 42, height: 44 },
  { month: "Jan 26", count: 39, height: 40 },
  { month: "Feb 26", count: 48, height: 50 },
  { month: "Mar 26", count: 52, height: 54 },
  { month: "Apr 26", count: 58, height: 60 },
  { month: "May 26", count: 64, height: 66 },
  { month: "Jun 26", count: 60, height: 62 },
  { month: "Jul 26", count: 55, height: 57 },
  { month: "Aug 26", count: 49, height: 51 },
  { month: "Sep 26", count: 53, height: 55 },
  { month: "Oct 26", count: 54, height: 56, isCurrent: true },
];

const CAPABILITY_COVERAGE = [
  { label: "Tool calling", percentage: 66 },
  { label: "Reasoning", percentage: 50 },
  { label: "Vision input", percentage: 49 },
  { label: "Open weights", percentage: 44 },
];

export function HeroScreen({ onLaunch }: HeroScreenProps) {
  return (
    <div className="hero-screen-container">
      {/* Subtle radial glow as per design.md §6.2 */}
      <div className="hero-glow-top" aria-hidden="true" />
      <div className="hero-glow-bottom" aria-hidden="true" />

      {/* Header bar */}
      <header className="hero-screen-header">
        <BrandLogo />
        <button
          type="button"
          onClick={() => onLaunch("compare")}
          className="btn btn-secondary text-xs py-1.5 px-3"
        >
          Enter App <ArrowRight size={13} className="ml-1" />
        </button>
      </header>

      {/* Hero Body */}
      <div className="hero-screen-content">
        {/* Updated pill per design.md §6.2 */}
        <div className="hero-badge-wrap">
          <span className="hero-pill flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Updated Oct 27, 2026</span>
            <span className="text-slate-500">·</span>
            <Sparkles size={12} className="text-emerald-400" />
            <span className="text-slate-400">OneAtlas Dark Specification</span>
          </span>
        </div>

        {/* H1 Headline per design.md §6.2 */}
        <h1 className="hero-title text-balance">
          Every AI model, <span className="text-emerald-400">compared.</span>
        </h1>

        <p className="hero-subtitle text-balance">
          Compare specs, benchmark scores, sample pricing, and estimate token costs across frontier and open AI models side by side in an interactive workspace.
        </p>

        {/* Primary & Secondary CTAs per design.md §6.2 */}
        <div className="hero-actions">
          <button
            type="button"
            onClick={() => onLaunch("compare")}
            className="btn btn-hero"
            autoFocus
          >
            <span>Launch workspace</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => onLaunch("estimator")}
            className="btn btn-hero-secondary"
          >
            <Calculator size={15} />
            <span>Cost estimator</span>
          </button>
          <button
            type="button"
            onClick={() => onLaunch("details")}
            className="btn btn-hero-secondary"
          >
            <BrainCircuit size={15} />
            <span>Model deep dive</span>
          </button>
        </div>

        {/* 6.3 Stat Strip: 4-up grid (2-up mobile) */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#141a1f] text-left">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Models</div>
            <div className="text-2xl font-semibold text-slate-100 tabular-nums mt-0.5">1,123</div>
            <div className="text-[11px] text-slate-500 mt-0.5">4 active in sample</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#141a1f] text-left">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Labs</div>
            <div className="text-2xl font-semibold text-slate-100 tabular-nums mt-0.5">78</div>
            <div className="text-[11px] text-slate-500 mt-0.5">OpenAI, Anthropic, Google...</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#141a1f] text-left">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Providers</div>
            <div className="text-2xl font-semibold text-slate-100 tabular-nums mt-0.5">220</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Multi-cloud API routes</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#141a1f] text-left">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">API Listings</div>
            <div className="text-2xl font-semibold text-slate-100 tabular-nums mt-0.5">8,289</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Live pricing indexed</div>
          </div>
        </div>

        {/* 6.4 Two Insight Cards per design.md */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left my-2">
          {/* Card 1: Releases per month */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#141a1f]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-200">Releases per month</span>
              <span className="text-xs text-slate-400 font-mono">608 in 12 mo</span>
            </div>
            {/* 12 monthly bars */}
            <div className="h-28 flex items-end justify-between gap-1.5 pt-4 pb-2 border-b border-slate-800/80">
              {MONTHLY_RELEASES.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] text-slate-200 px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                    {bar.month}: {bar.count}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      bar.isCurrent
                        ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.4)]"
                        : "bg-emerald-500/70 group-hover:bg-emerald-400"
                    }`}
                    style={{ height: `${bar.height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
              <span>Nov 25</span>
              <span>Oct 26 (Current)</span>
            </div>
          </div>

          {/* Card 2: Capability coverage */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#141a1f]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-200">Capability coverage</span>
              <span className="text-xs text-emerald-400 font-mono">Industry benchmarks</span>
            </div>
            <div className="space-y-3">
              {CAPABILITY_COVERAGE.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-200 font-mono tabular-nums">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222b32] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Workspace Nav Badges */}
        <div className="hero-features-grid mt-4">
          <div
            className="hero-feature-card cursor-pointer"
            onClick={() => onLaunch("compare")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onLaunch("compare")}
          >
            <div className="hero-feature-icon">
              <Cpu size={18} className="text-emerald-400" />
            </div>
            <div>
              <strong className="text-white text-sm block">Side-by-side matrix</strong>
              <p className="text-xs text-slate-400 mt-1">
                Pin headers, compare 2-4 models, and evaluate pricing badges.
              </p>
            </div>
          </div>

          <div
            className="hero-feature-card cursor-pointer"
            onClick={() => onLaunch("estimator")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onLaunch("estimator")}
          >
            <div className="hero-feature-icon">
              <Calculator size={18} className="text-sky-400" />
            </div>
            <div>
              <strong className="text-white text-sm block">Usage cost estimator</strong>
              <p className="text-xs text-slate-400 mt-1">
                Synchronized 0-100M token inputs with cheapest model savings.
              </p>
            </div>
          </div>

          <div
            className="hero-feature-card cursor-pointer"
            onClick={() => onLaunch("details")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onLaunch("details")}
          >
            <div className="hero-feature-icon">
              <BrainCircuit size={18} className="text-purple-400" />
            </div>
            <div>
              <strong className="text-white text-sm block">Model deep dive</strong>
              <p className="text-xs text-slate-400 mt-1">
                Intelligence, coding, and agentic capability ratings.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 max-w-lg text-center">
          Frontend Engineering Assessment · OneAtlas Dark Theme · Next.js 16 App Router
        </p>
      </div>
    </div>
  );
}

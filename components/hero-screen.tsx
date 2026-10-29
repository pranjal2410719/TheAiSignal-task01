"use client";

import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

interface HeroScreenProps {
  onLaunch: (tab?: "compare" | "estimator" | "playground" | "history" | "details" | "all") => void;
}

const MONTHS_DATA = [
  { label: "Nov 25", count: 34 },
  { label: "Dec 25", count: 42 },
  { label: "Jan 26", count: 39 },
  { label: "Feb 26", count: 48 },
  { label: "Mar 26", count: 52 },
  { label: "Apr 26", count: 58 },
  { label: "May 26", count: 64 },
  { label: "Jun 26", count: 60 },
  { label: "Jul 26", count: 55 },
  { label: "Aug 26", count: 49 },
  { label: "Sep 26", count: 53 },
  { label: "Oct 26", count: 54 },
];

const CAPS_DATA = [
  { label: "Tool calling", v: 66 },
  { label: "Reasoning", v: 50 },
  { label: "Vision input", v: 49 },
  { label: "Open weights", v: 44 },
];

export function HeroScreen({ onLaunch }: HeroScreenProps) {
  const [hover, setHover] = useState<number | null>(null);

  const max = useMemo(() => Math.max(...MONTHS_DATA.map((m) => m.count), 1), []);
  const total = useMemo(() => MONTHS_DATA.reduce((a, m) => a + m.count, 0), []);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between">
      {/* Top Header bar */}
      <header className="border-b border-line bg-surface/90 backdrop-blur-md sticky top-0 z-50">
        <div className="wrap flex h-14 items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onLaunch("compare")}
              className="btn btn-ink"
            >
              Launch workspace →
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="wrap pt-10 pb-16 md:pt-16 md:pb-20 my-auto">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_32rem] xl:grid-cols-[minmax(0,1fr)_36rem]">
          {/* Left Hero Content */}
          <div className="max-w-2xl">
            <p className="text-[0.82rem] font-medium text-muted">Last refreshed Oct 27, 2026</p>
            <h1 className="hero-title mt-3">The whole AI model landscape, on one page.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-2">
              Compare context windows, token prices, capabilities and where each model is hosted. Sort, filter and calculate
              exact monthly API token spend side by side in an interactive workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="btn btn-ink"
                onClick={() => onLaunch("compare")}
                autoFocus
              >
                Launch workspace
              </button>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => onLaunch("playground")}
              >
                AI Playground
              </button>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => onLaunch("estimator")}
              >
                Cost estimator
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-1 px-2 text-[0.88rem] font-medium text-ink-2 hover:text-ink cursor-pointer bg-transparent border-none"
                onClick={() => onLaunch("details")}
              >
                Model deep dive <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>
          </div>

          {/* Right Pastel Tile */}
          <div className="tile p-5 sm:p-6" data-tone="oat">
            {/* 4 Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="flex min-w-0 flex-col-reverse">
                <span className="mt-1 truncate text-[0.72rem] font-medium opacity-70">Models</span>
                <span className="serif text-[1.35rem] leading-none tracking-[-0.02em] sm:text-[1.6rem]">1,123</span>
              </div>
              <div className="flex min-w-0 flex-col-reverse">
                <span className="mt-1 truncate text-[0.72rem] font-medium opacity-70">Labs</span>
                <span className="serif text-[1.35rem] leading-none tracking-[-0.02em] sm:text-[1.6rem]">78</span>
              </div>
              <div className="flex min-w-0 flex-col-reverse">
                <span className="mt-1 truncate text-[0.72rem] font-medium opacity-70">Providers</span>
                <span className="serif text-[1.35rem] leading-none tracking-[-0.02em] sm:text-[1.6rem]">220</span>
              </div>
              <div className="flex min-w-0 flex-col-reverse">
                <span className="mt-1 truncate text-[0.72rem] font-medium opacity-70">API listings</span>
                <span className="serif text-[1.35rem] leading-none tracking-[-0.02em] sm:text-[1.6rem]">8,289</span>
              </div>
            </div>

            {/* Insight Panels */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {/* Releases per month */}
              <div className="panel">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.78rem] font-medium text-ink">Releases per month</span>
                  <span className="text-[0.72rem] opacity-70 text-ink">
                    <span className="serif text-[1rem] opacity-100 font-semibold">{hover != null ? MONTHS_DATA[hover].count : total}</span>{" "}
                    {hover != null ? MONTHS_DATA[hover].label : "in 12 mo"}
                  </span>
                </div>
                <div className="mt-3 flex h-24 items-end gap-1">
                  {MONTHS_DATA.map((m, i) => (
                    <div
                      key={m.label}
                      className="flex h-full flex-1 items-end cursor-pointer"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <span
                        className="bar"
                        style={{
                          height: `${Math.max(6, (m.count / max) * 100)}%`,
                          background: hover === i ? "rgba(20,20,19,.75)" : undefined,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[0.66rem] opacity-60 text-ink">
                  <span>{MONTHS_DATA[0].label}</span>
                  <span>{MONTHS_DATA[11].label}</span>
                </div>
              </div>

              {/* Capability Coverage */}
              <div className="panel">
                <span className="text-[0.78rem] font-medium text-ink">Capability coverage</span>
                <ul className="mt-3 space-y-2.5">
                  {CAPS_DATA.map((c) => (
                    <li key={c.label}>
                      <div className="flex justify-between text-[0.74rem] text-ink">
                        <span>{c.label}</span>
                        <span className="mono font-semibold">{c.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#141413]/70 dark:bg-[#f5f3ec]/80"
                          style={{ width: `${c.v}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandLogo />
            <span>· An independent directory of AI models.</span>
          </div>
          <span>Frontend Engineering Assessment · Next.js 16 + React 19 + Tailwind CSS 4</span>
        </div>
      </footer>
    </div>
  );
}

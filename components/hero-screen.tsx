"use client";

import { ArrowRight, BrainCircuit, Calculator, CheckCircle2, Cpu, Sparkles } from "lucide-react";
import { models } from "@/lib/models";
import { BrandLogo } from "@/components/brand-logo";

interface HeroScreenProps {
  onLaunch: (tab?: "compare" | "estimator" | "details" | "all") => void;
}

export function HeroScreen({ onLaunch }: HeroScreenProps) {
  return (
    <div className="hero-screen-container">
      {/* Background glow effects */}
      <div className="hero-glow-top" aria-hidden="true" />
      <div className="hero-glow-bottom" aria-hidden="true" />

      {/* Hero Header */}
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

      {/* Main Full-Screen Intro Card */}
      <div className="hero-screen-content">
        <div className="hero-badge-wrap">
          <span className="hero-pill">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Frontend Engineering Assessment · OneAtlas Dark Theme</span>
          </span>
        </div>

        <h1 className="hero-title text-balance">
          Find the right <span className="text-emerald-400">AI model</span> for your workload.
        </h1>

        <p className="hero-subtitle text-balance">
          Compare specs, benchmark scores, sample pricing, and calculate exact monthly API token spend side by side in an interactive workspace.
        </p>

        {/* Primary CTA */}
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
        </div>

        {/* Quick Features Row */}
        <div className="hero-features-grid">
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
              <strong className="text-white text-sm block">Side-by-side specs</strong>
              <p className="text-xs text-slate-400 mt-1">
                Context window, modalities, benchmark scores, and hosting providers.
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
                Synchronized token sliders with cheapest model & monthly savings calculation.
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
                Intelligence, coding, and agentic capability ratings scaled out of 60.
              </p>
            </div>
          </div>
        </div>

        {/* Catalog Statistics */}
        <div className="hero-stats-row">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{models.length} Sample Models Included</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Shareable URL State (`/compare?models=...`)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Next.js 16 + React 19 + Tailwind CSS 4</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 max-w-lg text-center">
          Illustrative assessment catalog data. Verification required before production reliance.
        </p>
      </div>
    </div>
  );
}

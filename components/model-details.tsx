"use client";

import type { ModelRecord } from "@/lib/types";
import { BrainCircuit, Code2, Cpu } from "lucide-react";

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 3 });

const tokens = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`
    : `${Math.round(value / 1_000)}K`;

interface ModelDetailsProps {
  selectedModels: ModelRecord[];
}

export function ModelDetails({ selectedModels }: ModelDetailsProps) {
  if (selectedModels.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-line bg-surface text-center text-muted border-dashed">
        <p className="text-sm">No models selected. Please select at least one model from the selector to view detailed specifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted">DEEP DIVE SPECIFICATIONS</p>
          <h2 className="serif text-2xl font-medium text-ink">Model Details & Profiles</h2>
        </div>
        <span className="chip font-mono">
          {selectedModels.length} models selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {selectedModels.map((model) => (
          <div className="p-6 rounded-2xl border border-line bg-surface space-y-4" key={model.id}>
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="serif text-xl font-medium text-ink">{model.name}</h3>
                  <span className={`chip ${model.weights === "Open" ? "bg-[var(--tile-olive)]/60 text-[#2d3a12]" : ""}`}>
                    {model.weights}
                  </span>
                </div>
                <span className="text-xs text-muted block mt-0.5">{model.lab} · Released {model.releaseDate}</span>
              </div>
              <span className="mono text-xs text-muted bg-sunken px-2 py-1 rounded border border-line">
                {model.id}
              </span>
            </div>

            {/* Quick 3-Tile KPI */}
            <div className="tile grid grid-cols-3 gap-3 p-4" data-tone={model.weights === "Open" ? "olive" : "sky"}>
              <div>
                <div className="serif text-[1.5rem] leading-none">{model.intelligenceScore.toFixed(1)}</div>
                <div className="mt-1 text-[0.72rem] opacity-75">Intelligence</div>
              </div>
              <div>
                <div className="serif text-[1.5rem] leading-none">{tokens(model.contextWindow)}</div>
                <div className="mt-1 text-[0.72rem] opacity-75">Context</div>
              </div>
              <div>
                <div className="serif text-[1.5rem] leading-none">{model.providers.length}</div>
                <div className="mt-1 text-[0.72rem] opacity-75">Providers</div>
              </div>
            </div>

            <p className="text-xs text-ink-2 leading-relaxed italic">
              &ldquo;{model.description}&rdquo;
            </p>

            {/* Specs Definition Grid */}
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Technical Limits & Pricing
              </span>
              <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line text-xs">
                <div className="p-3 border-r border-b border-line">
                  <dt className="text-muted">Context Window</dt>
                  <dd className="mono font-semibold text-ink mt-0.5">{tokens(model.contextWindow)}</dd>
                </div>
                <div className="p-3 border-b border-line">
                  <dt className="text-muted">Maximum Output</dt>
                  <dd className="mono font-semibold text-ink mt-0.5">{tokens(model.maxOutput)}</dd>
                </div>
                <div className="p-3 border-r border-line">
                  <dt className="text-muted">Input Price / 1M</dt>
                  <dd className="mono font-semibold text-ink mt-0.5">{money(model.inputPricePerMillion)}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-muted">Output Price / 1M</dt>
                  <dd className="mono font-semibold text-ink mt-0.5">{money(model.outputPricePerMillion)}</dd>
                </div>
              </dl>
            </div>

            {/* Benchmarks Section */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Benchmark Scores (Scaled / 60)
              </span>

              {/* Intelligence */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-ink-2">
                    <BrainCircuit size={13} className="text-accent" />
                    Intelligence Benchmark
                  </span>
                  <span className="mono font-semibold text-ink">{model.intelligenceScore.toFixed(1)} / 60</span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${Math.min(100, (model.intelligenceScore / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Coding */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-ink-2">
                    <Code2 size={13} className="text-accent" />
                    Coding Benchmark
                  </span>
                  <span className="mono font-semibold text-ink">{model.codingScore.toFixed(1)} / 60</span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${Math.min(100, (model.codingScore / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Agentic */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-ink-2">
                    <Cpu size={13} className="text-accent" />
                    Agentic Benchmark
                  </span>
                  <span className="mono font-semibold text-ink">{model.agenticScore.toFixed(1)} / 60</span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${Math.min(100, (model.agenticScore / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Providers */}
            <div className="pt-2 border-t border-line text-xs">
              <span className="text-muted block mb-1.5">Hosting Providers:</span>
              <div className="flex flex-wrap gap-1">
                {model.providers.map((p) => (
                  <span key={p} className="chip">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

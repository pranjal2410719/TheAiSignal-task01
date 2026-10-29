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
      <div className="panel p-8 text-center text-slate-400 border-dashed">
        <p className="text-sm">No models selected. Please select at least one model from the selector above to view detailed specifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-heading mb-4">
        <div>
          <p className="kicker">DEEP DIVE SPECIFICATIONS</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Model Details & Capability Profiles</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comprehensive technical limits, benchmark measurements, and deployment options for your selected set.
          </p>
        </div>
        <span className="pill text-xs font-mono text-emerald-300 border-emerald-500/20 bg-emerald-950/30 shrink-0">
          {selectedModels.length} models
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {selectedModels.map((model) => (
          <div className="panel p-5 sm:p-6 space-y-4" key={model.id}>
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{model.name}</h3>
                  <span className="pill text-[10px] uppercase font-semibold">{model.weights}</span>
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">{model.lab} · Released {model.releaseDate}</span>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {model.id}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic">
              &ldquo;{model.description}&rdquo;
            </p>

            {/* Benchmarks Section */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Benchmark Scores (Scaled / 60)
              </span>

              {/* Intelligence */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <BrainCircuit size={13} className="text-emerald-400" />
                    Intelligence Benchmark
                  </span>
                  <span className="font-mono text-white font-bold">{model.intelligenceScore.toFixed(1)} / 60</span>
                </div>
                <div className="benchmark-bar">
                  <div
                    className="benchmark-progress"
                    style={{ width: `${Math.min(100, (model.intelligenceScore / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Coding */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Code2 size={13} className="text-sky-400" />
                    Coding Benchmark
                  </span>
                  <span className="font-mono text-white font-bold">{model.codingScore.toFixed(1)} / 60</span>
                </div>
                <div className="benchmark-bar">
                  <div
                    className="benchmark-progress benchmark-progress-sky"
                    style={{ width: `${Math.min(100, (model.codingScore / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Agentic */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Cpu size={13} className="text-purple-400" />
                    Agentic Benchmark
                  </span>
                  <span className="font-mono text-white font-bold">{model.agenticScore.toFixed(1)} / 60</span>
                </div>
                <div className="benchmark-bar">
                  <div
                    className="benchmark-progress benchmark-progress-purple"
                    style={{ width: `${Math.min(100, (model.agenticScore / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Technical Limits Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Context Window</span>
                <strong className="text-white text-base font-mono block mt-0.5">{tokens(model.contextWindow)}</strong>
                <span className="text-slate-500 text-[10px]">tokens</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Max Output</span>
                <strong className="text-white text-base font-mono block mt-0.5">{tokens(model.maxOutput)}</strong>
                <span className="text-slate-500 text-[10px]">tokens</span>
              </div>
            </div>

            {/* Pricing Rates */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Input Price</span>
                <strong className="text-emerald-400 text-base font-mono block mt-0.5">
                  {money(model.inputPricePerMillion)}
                </strong>
                <span className="text-slate-500 text-[10px]">per 1M tokens</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Output Price</span>
                <strong className="text-slate-200 text-base font-mono block mt-0.5">
                  {money(model.outputPricePerMillion)}
                </strong>
                <span className="text-slate-500 text-[10px]">per 1M tokens</span>
              </div>
            </div>

            {/* Modalities & Providers */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Supported Modalities:</span>
                <div className="flex flex-wrap gap-1">
                  {model.inputModalities.map((item) => (
                    <span className="pill text-[10px]" key={item}>
                      In: {item}
                    </span>
                  ))}
                  {model.outputModalities.map((item) => (
                    <span className="pill text-[10px] text-sky-300 border-sky-500/20" key={item}>
                      Out: {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Active Hosting Providers:</span>
                <div className="flex flex-wrap gap-1">
                  {model.providers.map((p) => (
                    <span className="pill text-[10px]" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

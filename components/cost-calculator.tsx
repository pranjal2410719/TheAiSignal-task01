"use client";

import { useMemo, useState } from "react";
import type { ModelRecord } from "@/lib/types";
import { estimateMonthlyCost } from "@/lib/comparison";
import { Sparkles, TrendingDown, Zap } from "lucide-react";

const MAX_TOKENS = 100_000_000;
const STEP_TOKENS = 100_000;
const clampTokens = (value: number) =>
  Math.min(MAX_TOKENS, Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0));
const formatMoney = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const PRESETS = [
  { label: "Light", inTokens: 1_000_000, outTokens: 200_000, desc: "1M in · 200K out" },
  { label: "Standard", inTokens: 5_000_000, outTokens: 1_000_000, desc: "5M in · 1M out" },
  { label: "Heavy", inTokens: 20_000_000, outTokens: 4_000_000, desc: "20M in · 4M out" },
  { label: "Enterprise", inTokens: 50_000_000, outTokens: 10_000_000, desc: "50M in · 10M out" },
];

export function CostCalculator({ selectedModels }: { selectedModels: ModelRecord[] }) {
  const [inputTokens, setInputTokens] = useState(5_000_000);
  const [outputTokens, setOutputTokens] = useState(1_000_000);

  const costs = useMemo(() => {
    return selectedModels
      .map((model) => ({
        model,
        total: estimateMonthlyCost(inputTokens, outputTokens, model.inputPricePerMillion, model.outputPricePerMillion),
      }))
      .sort((a, b) => a.total - b.total);
  }, [selectedModels, inputTokens, outputTokens]);

  const cheapest = costs[0];
  const nextCheapest = costs[1];

  if (selectedModels.length < 2) {
    return (
      <div className="panel p-5 sm:p-6 text-sm text-slate-400 text-center border-dashed">
        Select at least two models to estimate and compare monthly costs.
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Best value highlight banner */}
      {cheapest && (
        <div className="best-value-banner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="best-value-icon">
                <Sparkles size={18} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kicker">Lowest Estimated Cost</span>
                  <span className="badge badge-emerald">Best Value</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 break-words">
                  {formatMoney(cheapest.total)}{" "}
                  <span className="text-xs font-normal text-slate-400">/ month</span>
                </h3>
                <p className="text-xs text-slate-300 truncate">
                  Powered by <strong className="text-white">{cheapest.model.name}</strong> ({cheapest.model.lab})
                </p>
              </div>
            </div>

            {nextCheapest && (
              <div className="bg-slate-900/80 md:bg-transparent p-3 md:p-0 rounded-lg border md:border-0 border-slate-800 shrink-0">
                <span className="text-xs text-slate-400 block">Monthly savings vs next cheapest:</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 block font-mono">
                  {formatMoney(nextCheapest.total - cheapest.total)}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  vs {nextCheapest.model.name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Controls and Results */}
      <div className="cost-grid">
        {/* Controls Panel */}
        <div className="panel cost-controls">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <p className="kicker">USAGE ASSUMPTIONS</p>
              <h3 className="text-base font-semibold text-white">Monthly Token Volume</h3>
            </div>
            <span className="pill text-xs">Per Month</span>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="text-xs text-slate-400 block mb-2 font-medium">Quick Workload Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isActive = inputTokens === preset.inTokens && outputTokens === preset.outTokens;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setInputTokens(preset.inTokens);
                      setOutputTokens(preset.outTokens);
                    }}
                    className={`preset-btn ${isActive ? "preset-btn-active" : ""}`}
                  >
                    <span className="font-semibold block text-xs">{preset.label}</span>
                    <span className="text-[10px] opacity-75 block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Tokens */}
          <div className="token-control">
            <label htmlFor="input-token-range" className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Zap size={14} className="text-emerald-400 shrink-0" />
                Input tokens / month
              </span>
              <strong className="text-emerald-400 font-mono text-xs sm:text-sm">
                {inputTokens.toLocaleString("en-US")}
              </strong>
            </label>
            <input
              id="input-token-range"
              type="range"
              min={0}
              max={MAX_TOKENS}
              step={STEP_TOKENS}
              value={inputTokens}
              onChange={(e) => setInputTokens(clampTokens(Number(e.target.value)))}
              aria-label="Monthly input tokens slider"
              className="w-full"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                className="field w-full font-mono text-sm"
                type="number"
                min={0}
                max={MAX_TOKENS}
                step={STEP_TOKENS}
                value={inputTokens}
                onChange={(e) => setInputTokens(clampTokens(Number(e.target.value)))}
                aria-label="Monthly input token count"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">tokens</span>
            </div>
          </div>

          {/* Output Tokens */}
          <div className="token-control">
            <label htmlFor="output-token-range" className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Zap size={14} className="text-emerald-400 shrink-0" />
                Output tokens / month
              </span>
              <strong className="text-emerald-400 font-mono text-xs sm:text-sm">
                {outputTokens.toLocaleString("en-US")}
              </strong>
            </label>
            <input
              id="output-token-range"
              type="range"
              min={0}
              max={MAX_TOKENS}
              step={STEP_TOKENS}
              value={outputTokens}
              onChange={(e) => setOutputTokens(clampTokens(Number(e.target.value)))}
              aria-label="Monthly output tokens slider"
              className="w-full"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                className="field w-full font-mono text-sm"
                type="number"
                min={0}
                max={MAX_TOKENS}
                step={STEP_TOKENS}
                value={outputTokens}
                onChange={(e) => setOutputTokens(clampTokens(Number(e.target.value)))}
                aria-label="Monthly output token count"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">tokens</span>
            </div>
          </div>

          <p className="muted text-xs leading-5 pt-3 border-t border-slate-800">
            Formula: (input tokens ÷ 1M × input rate) + (output tokens ÷ 1M × output rate).
            Estimates exclude caching discounts, batch API tiers, taxes, and provider fees.
          </p>
        </div>

        {/* Results Panel */}
        <div className="panel cost-results">
          <div className="section-heading mb-4">
            <div>
              <p className="kicker">ESTIMATED MONTHLY SPEND</p>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Cost Breakdown by Model</h2>
            </div>
            <span className="pill font-mono text-xs">USD</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {costs.map(({ model, total }, index) => {
              const isLowest = index === 0;
              const diffFromCheapest = total - cheapest.total;
              return (
                <div className="cost-line py-3.5" key={model.id}>
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                    <span className="text-xs font-mono text-slate-500 w-4 shrink-0">#{index + 1}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="text-xs sm:text-sm text-white truncate max-w-[150px] sm:max-w-none">
                          {model.name}
                        </strong>
                        {isLowest && <span className="badge badge-emerald shrink-0">Lowest bill</span>}
                      </div>
                      <span className="muted text-[11px] block">{model.lab}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <strong className="text-base sm:text-lg font-bold font-mono text-white block">
                      {formatMoney(total)}
                    </strong>
                    {!isLowest && (
                      <span className="block text-[11px] sm:text-xs text-emerald-400 font-medium">
                        +{formatMoney(diffFromCheapest)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {cheapest && nextCheapest && (
            <div className="savings-callout mt-5">
              <TrendingDown size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed">
                Choosing <strong className="text-white">{cheapest.model.name}</strong> instead of{" "}
                <strong className="text-white">{nextCheapest.model.name}</strong> saves an estimated{" "}
                <strong className="text-emerald-300 font-semibold font-mono">
                  {formatMoney(nextCheapest.total - cheapest.total)}
                </strong>{" "}
                per month for this usage pattern.
              </p>
            </div>
          )}

          <p className="muted mt-4 text-[11px] text-slate-500">
            Illustrative assessment dataset. Verify current provider pricing before production commitments.
          </p>
        </div>
      </div>
    </div>
  );
}

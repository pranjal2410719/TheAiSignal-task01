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
      <div className="p-6 rounded-2xl border border-line bg-surface text-sm text-muted text-center border-dashed">
        Select at least two models to estimate and compare monthly costs.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Best value highlight tile */}
      {cheapest && (
        <div className="tile p-5 sm:p-6" data-tone="cactus">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/10 dark:bg-white/10">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">Lowest Estimated Cost</span>
                  <span className="badge-lowest">Best Value</span>
                </div>
                <h3 className="serif text-2xl sm:text-3xl font-medium tracking-tight mt-0.5 break-words">
                  {formatMoney(cheapest.total)}{" "}
                  <span className="text-xs font-normal opacity-70">/ month</span>
                </h3>
                <p className="text-xs opacity-80 truncate">
                  Lowest bill: <strong>{cheapest.model.name}</strong> ({cheapest.model.lab})
                </p>
              </div>
            </div>

            {nextCheapest && (
              <div className="panel p-3 rounded-xl shrink-0">
                <span className="text-[11px] block opacity-75">Monthly savings vs next cheapest:</span>
                <span className="serif text-lg font-semibold block mono">
                  {formatMoney(nextCheapest.total - cheapest.total)}
                </span>
                <span className="text-[10px] block opacity-70 truncate">
                  vs {nextCheapest.model.name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Workloads */}
      <div className="p-5 rounded-2xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quick Workload Presets
          </span>
          <span className="text-xs text-muted">
            Synchronized 0 – 100M tokens
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => {
            const isMatch = inputTokens === preset.inTokens && outputTokens === preset.outTokens;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setInputTokens(preset.inTokens);
                  setOutputTokens(preset.outTokens);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? "border-ink bg-ink text-on-ink shadow-sm"
                    : "border-line bg-surface text-ink hover:bg-sunken"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-sm font-semibold">{preset.label}</strong>
                  <Zap size={12} className={isMatch ? "text-on-ink" : "text-muted"} />
                </div>
                <span className="text-[11px] opacity-75 block font-mono">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Token Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input tokens slider */}
        <div className="p-5 rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="input-tokens" className="text-sm font-semibold text-ink">
              Monthly Input Tokens
            </label>
            <div className="field h-8 px-2 w-36">
              <input
                id="input-tokens-num"
                type="number"
                min={0}
                max={MAX_TOKENS}
                step={STEP_TOKENS}
                value={inputTokens}
                onChange={(e) => setInputTokens(clampTokens(Number(e.target.value)))}
                className="w-full bg-transparent text-right font-mono text-xs text-ink outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-muted mb-4">
            Prompts, documents, system instructions, and context history.
          </p>

          <input
            id="input-tokens"
            type="range"
            min={0}
            max={MAX_TOKENS}
            step={STEP_TOKENS}
            value={inputTokens}
            onChange={(e) => setInputTokens(clampTokens(Number(e.target.value)))}
            className="cost-slider"
          />

          <div className="flex justify-between text-[11px] text-muted font-mono mt-2">
            <span>0</span>
            <span>25M</span>
            <span>50M</span>
            <span>75M</span>
            <span>100M</span>
          </div>
        </div>

        {/* Output tokens slider */}
        <div className="p-5 rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="output-tokens" className="text-sm font-semibold text-ink">
              Monthly Output Tokens
            </label>
            <div className="field h-8 px-2 w-36">
              <input
                id="output-tokens-num"
                type="number"
                min={0}
                max={MAX_TOKENS}
                step={STEP_TOKENS}
                value={outputTokens}
                onChange={(e) => setOutputTokens(clampTokens(Number(e.target.value)))}
                className="w-full bg-transparent text-right font-mono text-xs text-ink outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-muted mb-4">
            Generated responses, summaries, code, and agent actions.
          </p>

          <input
            id="output-tokens"
            type="range"
            min={0}
            max={MAX_TOKENS}
            step={STEP_TOKENS}
            value={outputTokens}
            onChange={(e) => setOutputTokens(clampTokens(Number(e.target.value)))}
            className="cost-slider"
          />

          <div className="flex justify-between text-[11px] text-muted font-mono mt-2">
            <span>0</span>
            <span>25M</span>
            <span>50M</span>
            <span>75M</span>
            <span>100M</span>
          </div>
        </div>
      </div>

      {/* Projected Monthly Bills Table */}
      <div className="p-5 rounded-2xl border border-line bg-surface">
        <h4 className="text-sm font-semibold text-ink mb-4">
          Projected Monthly Bills ({costs.length} models)
        </h4>

        <div className="space-y-2.5">
          {costs.map(({ model, total }, index) => {
            const isLowest = index === 0;
            const delta = total - (cheapest?.total ?? 0);

            return (
              <div
                key={model.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isLowest
                    ? "border-line bg-sunken"
                    : "border-line bg-surface hover:bg-sunken/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="mono text-xs text-muted w-5">#{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-ink">{model.name}</strong>
                      <span className="text-xs text-muted">({model.lab})</span>
                      {isLowest && <span className="badge-lowest">Lowest Bill</span>}
                    </div>
                    <span className="text-[11px] text-muted font-mono block mt-0.5">
                      ${model.inputPricePerMillion.toFixed(2)} in / ${model.outputPricePerMillion.toFixed(2)} out per 1M
                    </span>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                  <span className="serif text-xl font-medium text-ink block mono">
                    {formatMoney(total)}
                  </span>
                  <span className="text-[11px] text-muted block">
                    {isLowest ? (
                      <span className="text-ink font-medium">★ Lowest monthly cost</span>
                    ) : (
                      <span>+{formatMoney(delta)} vs lowest</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Formula Callout */}
      <div className="p-4 rounded-xl border border-line bg-sunken flex items-center gap-3 text-xs text-muted">
        <TrendingDown size={16} className="text-ink shrink-0" />
        <span>
          Cost formula:{" "}
          <code className="text-ink font-mono font-medium">
            (inputTokens ÷ 1,000,000 × inputRate) + (outputTokens ÷ 1,000,000 × outputRate)
          </code>
        </span>
      </div>
    </div>
  );
}

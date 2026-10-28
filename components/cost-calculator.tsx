"use client";

import { useMemo, useState } from "react";
import type { ModelRecord } from "@/lib/types";

const MAX_TOKENS = 100_000_000;
const STEP_TOKENS = 100_000;
const clampTokens = (value: number) => Math.min(MAX_TOKENS, Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0));
const formatMoney = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function CostCalculator({ selectedModels }: { selectedModels: ModelRecord[] }) {
  const [inputTokens, setInputTokens] = useState(5_000_000);
  const [outputTokens, setOutputTokens] = useState(1_000_000);
  const costs = useMemo(() => selectedModels.map((model) => ({
    model,
    total: inputTokens / 1_000_000 * model.inputPricePerMillion + outputTokens / 1_000_000 * model.outputPricePerMillion,
  })).sort((a, b) => a.total - b.total), [selectedModels, inputTokens, outputTokens]);
  const cheapest = costs[0];
  const nextCheapest = costs[1];

  if (selectedModels.length < 2) return <div className="panel p-5 text-sm text-slate-300">Select at least two models to estimate and compare monthly costs.</div>;

  return <div className="cost-grid">
    <div className="panel cost-controls">
      <p className="kicker">USAGE ASSUMPTIONS</p>
      <div className="token-control">
        <label htmlFor="input-token-range"><span>Input tokens / month</span><strong>{inputTokens.toLocaleString("en-US")}</strong></label>
        <input id="input-token-range" type="range" min={0} max={MAX_TOKENS} step={STEP_TOKENS} value={inputTokens} onChange={(event) => setInputTokens(clampTokens(Number(event.target.value)))} aria-label="Monthly input tokens slider" />
        <input className="field" type="number" min={0} max={MAX_TOKENS} step={STEP_TOKENS} value={inputTokens} onChange={(event) => setInputTokens(clampTokens(Number(event.target.value)))} aria-label="Monthly input token count" />
      </div>
      <div className="token-control">
        <label htmlFor="output-token-range"><span>Output tokens / month</span><strong>{outputTokens.toLocaleString("en-US")}</strong></label>
        <input id="output-token-range" type="range" min={0} max={MAX_TOKENS} step={STEP_TOKENS} value={outputTokens} onChange={(event) => setOutputTokens(clampTokens(Number(event.target.value)))} aria-label="Monthly output tokens slider" />
        <input className="field" type="number" min={0} max={MAX_TOKENS} step={STEP_TOKENS} value={outputTokens} onChange={(event) => setOutputTokens(clampTokens(Number(event.target.value)))} aria-label="Monthly output token count" />
      </div>
      <p className="muted text-xs leading-5">Estimated spend = input tokens ÷ 1M × input rate + output tokens ÷ 1M × output rate. Excludes cache discounts, taxes, and provider-specific fees.</p>
    </div>
    <div className="panel cost-results">
      <div className="section-heading"><div><p className="kicker">ESTIMATED MONTHLY SPEND</p><h2 className="text-xl font-semibold">Cost by model</h2></div><span className="pill">USD</span></div>
      {costs.map(({ model, total }, index) => <div className="cost-line" key={model.id}>
        <div><strong className="block text-sm">{model.name}</strong><span className="muted text-xs">{model.lab}</span>{index === 0 && <span className="badge">Lowest bill</span>}</div>
        <div className="text-right"><strong>{formatMoney(total)}</strong>{index === 1 && cheapest && <span className="block text-xs text-emerald-300">{formatMoney(total - cheapest.total)} more than lowest</span>}</div>
      </div>)}
      {cheapest && nextCheapest && <p className="muted mt-4 text-xs leading-5">Choosing {cheapest.model.name} instead of {nextCheapest.model.name} saves an estimated {formatMoney(nextCheapest.total - cheapest.total)} per month for this usage.</p>}
      <p className="muted mt-3 text-xs">All prices are illustrative assessment data and are not verified live rates.</p>
    </div>
  </div>;
}

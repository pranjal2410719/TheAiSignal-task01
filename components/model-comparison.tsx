"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Copy, Search, X } from "lucide-react";
import { CostCalculator } from "@/components/cost-calculator";
import { BrandLogo } from "@/components/brand-logo";
import { DEFAULT_MODEL_IDS, MAX_SELECTED_MODELS, MIN_SELECTED_MODELS, models } from "@/lib/models";
import type { ModelRecord } from "@/lib/types";

function selectionFromSearch(search: string): string[] {
  const params = new URLSearchParams(search);
  if (!params.has("models")) return DEFAULT_MODEL_IDS;
  const validIds = new Set(models.map((model) => model.id));
  return [...new Set((params.get("models") ?? "").split(",").filter((id) => validIds.has(id)))].slice(0, MAX_SELECTED_MODELS);
}

const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 3 });
const tokens = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M` : `${Math.round(value / 1_000)}K`;

export function ModelComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_MODEL_IDS);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [urlInitialized, setUrlInitialized] = useState(false);

  useEffect(() => {
    setSelectedIds(selectionFromSearch(window.location.search));
    setUrlInitialized(true);
    const onPopState = () => setSelectedIds(selectionFromSearch(window.location.search));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!urlInitialized) return;
    const url = new URL(window.location.href);
    url.searchParams.set("models", selectedIds.join(","));
    window.history.replaceState(null, "", url);
  }, [selectedIds, urlInitialized]);

  const selectedModels = useMemo(() => selectedIds.flatMap((id) => {
    const model = models.find((candidate) => candidate.id === id);
    return model ? [model] : [];
  }), [selectedIds]);
  const availableModels = useMemo(() => models.filter((model) =>
    !selectedIds.includes(model.id) && `${model.name} ${model.lab} ${model.providers.join(" ")} ${model.id}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [query, selectedIds]);
  const updateSelection = useCallback((id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((currentId) => currentId !== id)
      : current.length < MAX_SELECTED_MODELS ? [...current, id] : current);
  }, []);
  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this comparison URL:", window.location.href);
    }
  };

  const lowestInput = selectedModels.length ? Math.min(...selectedModels.map((model) => model.inputPricePerMillion)) : -1;
  const lowestOutput = selectedModels.length ? Math.min(...selectedModels.map((model) => model.outputPricePerMillion)) : -1;
  const rows: { label: string; value: (model: ModelRecord) => ReactNode }[] = [
    { label: "Context window", value: (model) => <><strong>{tokens(model.contextWindow)}</strong><span className="muted block text-xs">tokens</span></> },
    { label: "Maximum output", value: (model) => <><strong>{tokens(model.maxOutput)}</strong><span className="muted block text-xs">tokens</span></> },
    { label: "Input modalities", value: (model) => <>{model.inputModalities.map((item) => <span className="pill" key={item}>{item}</span>)}</> },
    { label: "Output modalities", value: (model) => <>{model.outputModalities.map((item) => <span className="pill" key={item}>{item}</span>)}</> },
    { label: "Input price / 1M", value: (model) => <><strong>{money(model.inputPricePerMillion)}</strong>{model.inputPricePerMillion === lowestInput && <span className="badge">Lowest</span>}</> },
    { label: "Output price / 1M", value: (model) => <><strong>{money(model.outputPricePerMillion)}</strong>{model.outputPricePerMillion === lowestOutput && <span className="badge">Lowest</span>}</> },
    { label: "Intelligence benchmark", value: (model) => <strong>{model.intelligenceScore.toFixed(1)} / 60</strong> },
    { label: "Coding benchmark", value: (model) => <strong>{model.codingScore.toFixed(1)} / 60</strong> },
    { label: "Agentic benchmark", value: (model) => <strong>{model.agenticScore.toFixed(1)} / 60</strong> },
    { label: "Open weights", value: (model) => <span className="pill">{model.weights}</span> },
    { label: "Active providers", value: (model) => <>{model.providers.map((provider) => <span className="pill" key={provider}>{provider}</span>)}</> },
  ];

  return <main id="top" className="page-shell">
    <header className="topbar"><BrandLogo /><nav className="nav" aria-label="Main navigation"><a href="#selector">Models</a><a href="#comparison">Compare</a><a href="#estimator">Cost estimator</a></nav></header>
    <div className="wrap">
      <section className="hero">
        <div><p className="kicker">MODEL INTELLIGENCE, IN ONE PLACE</p><h1>Compare AI models<span className="text-emerald-300">.</span></h1><p className="lead">Explore capabilities, technical limits, sample pricing, and estimated monthly spend side by side.</p><p className="muted mt-4 text-xs">Assessment demo catalog · Not a live model or pricing feed</p></div>
        <aside className="panel hero-panel">
          <div className="stat-grid"><div className="stat"><strong>{models.length}</strong><span>sample models</span></div><div className="stat"><strong>{new Set(models.map((model) => model.lab)).size}</strong><span>labs</span></div><div className="stat"><strong>{new Set(models.flatMap((model) => model.providers)).size}</strong><span>provider names</span></div></div>
          <div className="feature-row"><span className="text-emerald-300">01</span><div><strong>Compare specifications</strong><p>Context, modalities, benchmark sample values, and provider lists.</p></div></div>
          <div className="feature-row"><span className="text-emerald-300">02</span><div><strong>Estimate usage costs</strong><p>Change token volume and compare estimated monthly spend.</p></div></div>
        </aside>
      </section>

      <section id="selector" className="section">
        <div className="section-heading"><div><p className="kicker">YOUR COMPARISON</p><h2>Choose models <span className="muted text-sm">{selectedModels.length}/{MAX_SELECTED_MODELS}</span></h2><p>Select between two and four models to unlock the matrix and estimator.</p></div><button className="btn btn-secondary" type="button" onClick={shareLink}><Copy size={15} />{copied ? "Link copied" : "Share comparison"}</button></div>
        <div className="panel">
          <div className="picker"><label className="sr-only" htmlFor="model-search">Search model name, lab, or provider</label><Search size={16} className="muted" aria-hidden="true" /><input id="model-search" className="field search-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model, lab, or provider…" /><span className="muted text-xs">{availableModels.length} available</span></div>
          <div className="model-options">{availableModels.map((model) => <button className="model-option" type="button" key={model.id} disabled={selectedIds.length >= MAX_SELECTED_MODELS} onClick={() => updateSelection(model.id)}>+ {model.name} <span className="muted">· {model.lab}</span></button>)}</div>
          <div className="selection-row">{selectedModels.map((model) => <span className="chip" key={model.id}>{model.name}<button type="button" aria-label={`Remove ${model.name}`} onClick={() => updateSelection(model.id)}><X size={13} /></button></span>)}{selectedModels.length === 0 && <span className="muted text-sm">No models selected. Search above to add models.</span>}</div>
        </div>
        {selectedModels.length < MIN_SELECTED_MODELS && <div className="notice mt-4">Select at least two models to compare specifications and estimate costs. You can select up to four models.</div>}
        <p className="muted mt-3 text-xs">Shared state is encoded in the <code>?models=</code> query parameter. Unknown IDs are ignored and duplicate IDs are removed.</p>
      </section>

      {selectedModels.length >= MIN_SELECTED_MODELS && <>
        <section id="comparison" className="section">
          <div className="section-heading"><div><p className="kicker">SIDE BY SIDE</p><h2>Technical comparison</h2><p>Lowest sample input and output rates are highlighted within the selected set.</p></div></div>
          <div className="table-wrap" role="region" aria-label="Model comparison table" tabIndex={0}>
            <table><thead><tr><th scope="col">Specification</th>{selectedModels.map((model) => <th scope="col" key={model.id}><strong className="block">{model.name}</strong><span className="muted block mt-1 text-xs">{model.lab}</span><span className="muted block mt-2 text-xs">Release: {model.releaseDate}</span></th>)}</tr></thead>
              <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{selectedModels.map((model) => <td key={model.id}>{row.value(model)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
        <section id="estimator" className="section"><div className="section-heading"><div><p className="kicker">PLAN YOUR SPEND</p><h2>Monthly cost estimator</h2><p>Defaults: 5,000,000 input tokens and 1,000,000 output tokens.</p></div></div><CostCalculator selectedModels={selectedModels} /></section>
      </>}
      <aside className="notice mb-8">Data note: all model prices, release dates, benchmark values, and provider lists in this demonstration are sample data. Verify current specifications and pricing with each provider before making decisions.</aside>
      <footer className="footer"><BrandLogo /><span>Built for the Frontend Engineering Assessment · Sample data only</span><a href="#top" className="hover:text-emerald-300">Back to top ↑</a></footer>
    </div>
  </main>;
}

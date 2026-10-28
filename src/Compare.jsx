import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp, ArrowLeft, ArrowRight, AudioLines, Check, ChevronDown,
  CircleHelp, Command, Copy, ExternalLink, Eye, FileText, Image, Search,
  SlidersHorizontal, Sparkles, X, Zap
} from "lucide-react";
import "./compare.css";

const models = [
  {
    id: "openai/gpt-6.1-terra", name: "GPT-6.1 Terra", lab: "OpenAI", mark: "◎",
    description: "Fast, efficient visual reasoning and precise computer use.",
    context: 1050000, outputLimit: 128000, input: ["Text", "Image", "PDF"], output: ["Text"],
    inputPrice: 1, outputPrice: 5, cacheRead: 0.05, intelligence: 48.1, coding: 52.4, agentic: 45.0,
    providers: ["Azure", "Together", "OpenRouter"], released: "Oct 26, 2026", weights: "Closed"
  },
  {
    id: "deepseek/deepseek-v4.1-flash-uncensored", name: "DeepSeek V4.1 Flash", lab: "DeepSeek", mark: "◈",
    description: "High-throughput model for code execution and mathematical reasoning.",
    context: 1000000, outputLimit: 131000, input: ["Text", "Image"], output: ["Text"],
    inputPrice: 0.33, outputPrice: 1.32, cacheRead: 0.008, intelligence: 46.2, coding: 54.1, agentic: 43.8,
    providers: ["DeepInfra", "Fireworks", "Groq", "Together"], released: "Oct 23, 2026", weights: "Open"
  },
  {
    id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", lab: "Anthropic", mark: "✳",
    description: "Strong reasoning, coding, and multimodal comprehension.",
    context: 200000, outputLimit: 8192, input: ["Text", "Image"], output: ["Text"],
    inputPrice: 3, outputPrice: 15, cacheRead: 0.3, intelligence: 51.2, coding: 58.7, agentic: 49.3,
    providers: ["AWS Bedrock", "GCP Vertex", "OpenRouter"], released: "Jun 20, 2024", weights: "Closed"
  },
];

const fmtTokens = (n) => n >= 1000000 ? `${(n / 1000000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M` : `${Math.round(n / 1000)}K`;
const money = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
const readInitial = () => {
  const ids = new URLSearchParams(window.location.search).get("models");
  if (ids) {
    const valid = ids.split(",").filter((id) => models.some((model) => model.id === id));
    if (valid.length) return valid.slice(0, 4);
  }
  return [models[0].id, models[1].id];
};

function BrandMark({ model, small = false }) {
  return <span className={`model-mark ${small ? "model-mark-small" : ""} mark-${model.lab.toLowerCase()}`} aria-hidden="true">{model.mark}</span>;
}

function MetricBar({ value, max = 60 }) {
  return <span className="metric-bar"><span style={{ width: `${Math.min(100, value / max * 100)}%` }} /></span>;
}

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState(readInitial);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [inputTokens, setInputTokens] = useState(5000000);
  const [outputTokens, setOutputTokens] = useState(1000000);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const selected = useMemo(() => selectedIds.map((id) => models.find((model) => model.id === id)).filter(Boolean), [selectedIds]);
  const available = useMemo(() => models.filter((model) => !selectedIds.includes(model.id) && `${model.name} ${model.lab}`.toLowerCase().includes(query.toLowerCase())), [query, selectedIds]);
  const costs = useMemo(() => selected.map((model) => ({
    id: model.id,
    total: (inputTokens / 1000000) * model.inputPrice + (outputTokens / 1000000) * model.outputPrice,
  })), [selected, inputTokens, outputTokens]);
  const lowestCost = Math.min(...costs.map((cost) => cost.total));

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedIds.length) url.searchParams.set("models", selectedIds.join(","));
    else url.searchParams.delete("models");
    window.history.replaceState({}, "", url);
  }, [selectedIds]);

  function toggleModel(id) {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 4 ? [...current, id] : current);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this comparison URL:", window.location.href);
    }
  }

  const lowestInput = Math.min(...selected.map((model) => model.inputPrice));
  const lowestOutput = Math.min(...selected.map((model) => model.outputPrice));

  return (
    <div className="compare-app">
      <header className="compare-topbar">
        <a className="compare-brand" href="/" aria-label="The AI Signal home"><span className="compare-brand-icon"><AudioLines size={19} /></span><span>OneAtlas</span></a>
        <nav className="compare-nav" aria-label="Main navigation">
          <a className="active" href="/compare">Models</a><a href="#rankings">Rankings</a><a href="#benchmarks">Benchmarks</a><a href="#labs">Labs</a><a href="#providers">Providers</a>
        </nav>
        <button className="global-search" onClick={() => { setPickerOpen(true); document.getElementById("model-search")?.focus(); }}><Search size={15} /><span>Search models, labs, providers</span><kbd><Command size={11} /> K</kbd></button>
      </header>

      <main className="compare-main">
        <section className="compare-intro">
          <div className="intro-copy">
            <p className="compare-updated"><span className="status-dot" /> Model intelligence, in one place</p>
            <h1>Compare AI models<span>.</span></h1>
            <p className="intro-description">Specs, pricing, capabilities, and providers side by side. Find the right model for your workflow and budget.</p>
            <div className="intro-actions"><a className="button-light" href="#comparison">Compare models <ArrowRight size={16} /></a><a className="button-quiet" href="#estimator">Estimate cost <ArrowDownUp size={15} /></a></div>
          </div>
          <aside className="overview-panel">
            <div className="overview-stat"><span>Models in this demo</span><strong>{models.length.toLocaleString("en-US")}</strong><small>Across leading AI labs</small></div>
            <div className="overview-stat"><span>Labs</span><strong>{new Set(models.map((model) => model.lab)).size.toLocaleString("en-US")}</strong><small>Research organizations</small></div>
            <div className="overview-stat"><span>Providers</span><strong>{new Set(models.flatMap((model) => model.providers)).size.toLocaleString("en-US")}</strong><small>API access points</small></div>
            <div className="overview-chart">
              <div className="chart-heading"><span>Capability coverage</span><span className="chart-caption">Across the catalog</span></div>
              {[["Tool calling",66],["Reasoning",50],["Vision input",49],["Open weights",44]].map(([label, value]) => <div className="coverage-row" key={label}><div><span>{label}</span><small>{value}%</small></div><MetricBar value={value} max={100} /></div>)}
            </div>
          </aside>
        </section>

        <section className="model-selection" aria-label="Model selection">
          <div className="selection-heading"><div><span className="eyebrow-label">YOUR COMPARISON</span><h2>Choose your models <span>{selected.length}/4</span></h2></div><button className="share-button" onClick={copyLink}><Copy size={15} /> {copied ? "Link copied" : "Share comparison"}</button></div>
          <div className="selected-models">
            {selected.map((model) => <div className="selected-chip" key={model.id}><BrandMark model={model} small /><span>{model.name}</span><button aria-label={`Remove ${model.name}`} onClick={() => toggleModel(model.id)}><X size={14} /></button></div>)}
            {selected.length < 4 && <button className="add-model" onClick={() => setPickerOpen((open) => !open)}><span>+</span> Add a model</button>}
          </div>
          {pickerOpen && <div className="model-picker">
            <div className="picker-search"><Search size={16} /><input id="model-search" autoFocus placeholder="Search by model or provider..." value={query} onChange={(event) => setQuery(event.target.value)} /><button aria-label="Close model picker" onClick={() => setPickerOpen(false)}><X size={16} /></button></div>
            <div className="picker-results">{available.length ? available.map((model) => <button key={model.id} onClick={() => { toggleModel(model.id); setQuery(""); if (selected.length >= 3) setPickerOpen(false); }}><BrandMark model={model} /><span><strong>{model.name}</strong><small>{model.lab} · {model.id}</small></span><span className="picker-add">Add +</span></button>) : <p>No more matching models. Try a different search.</p>}</div>
          </div>}
          {selected.length < 2 && <div className="empty-state"><CircleHelp size={20} /><div><strong>Select at least 2 models to compare technical specs and cost</strong><span>Add another model to unlock the comparison matrix and estimator.</span></div></div>}
        </section>

        {selected.length >= 2 && <>
          <section className="comparison-section" id="comparison">
            <div className="section-heading"><div><span className="eyebrow-label">SIDE BY SIDE</span><h2>Technical comparison</h2></div><div className="section-heading-note"><SlidersHorizontal size={15} /> Horizontal swipe on mobile</div></div>
            <div className="comparison-tabs"><button className={activeTab === "overview" ? "selected" : ""} onClick={() => setActiveTab("overview")}>Overview</button><button className={activeTab === "pricing" ? "selected" : ""} onClick={() => setActiveTab("pricing")}>Pricing</button><button className={activeTab === "benchmarks" ? "selected" : ""} onClick={() => setActiveTab("benchmarks")}>Benchmarks</button></div>
            <div className="matrix-scroll" role="region" aria-label="Model comparison table" tabIndex={0}>
              <table className="comparison-table">
                <thead><tr><th className="row-label">MODEL DETAILS</th>{selected.map((model) => <th key={model.id}><div className="table-model"><BrandMark model={model} /><div><strong>{model.name}</strong><span>{model.lab}</span></div></div><span className="model-release">Released {model.released}</span></th>)}</tr></thead>
                <tbody>
                  <tr><th className="row-label">Context window</th>{selected.map((model) => <td key={model.id}><strong className="large-value">{fmtTokens(model.context)}</strong><span className="cell-subtext">tokens</span></td>)}</tr>
                  <tr><th className="row-label">Max output</th>{selected.map((model) => <td key={model.id}><strong>{fmtTokens(model.outputLimit)}</strong><span className="cell-subtext">tokens</span></td>)}</tr>
                  <tr><th className="row-label">Input modalities</th>{selected.map((model) => <td key={model.id}><div className="modality-list">{model.input.map((item) => <span className="modality-pill" key={item}>{item === "Text" ? <FileText size={12} /> : item === "Image" ? <Image size={12} /> : <Eye size={12} />}{item}</span>)}</div></td>)}</tr>
                  <tr><th className="row-label">Output modalities</th>{selected.map((model) => <td key={model.id}><div className="modality-list">{model.output.map((item) => <span className="modality-pill" key={item}><FileText size={12} />{item}</span>)}</div></td>)}</tr>
                  {(activeTab === "overview" || activeTab === "pricing") && <><tr className="pricing-divider"><th className="row-label">Input / 1M tokens</th>{selected.map((model) => <td key={model.id}><strong className="price-value">{money(model.inputPrice)}</strong>{model.inputPrice === lowestInput && <span className="lowest-pill"><Check size={11} /> Lowest</span>}</td>)}</tr><tr><th className="row-label">Output / 1M tokens</th>{selected.map((model) => <td key={model.id}><strong className="price-value">{money(model.outputPrice)}</strong>{model.outputPrice === lowestOutput && <span className="lowest-pill"><Check size={11} /> Lowest</span>}</td>)}</tr></>}
                  {(activeTab === "overview" || activeTab === "benchmarks") && <>{[["Intelligence", "intelligence"],["Coding", "coding"],["Agentic capability", "agentic"]].map(([label, key]) => <tr key={key}><th className="row-label">{label}</th>{selected.map((model) => <td key={model.id}><div className="benchmark-value"><strong>{model[key].toFixed(1)}</strong><MetricBar value={model[key]} /><span>/ 60</span></div></td>)}</tr>)}</>}
                  <tr><th className="row-label">Open weights</th>{selected.map((model) => <td key={model.id}><span className={`weight-pill ${model.weights === "Open" ? "weight-open" : ""}`}>{model.weights}</span></td>)}</tr>
                  <tr><th className="row-label">Active providers</th>{selected.map((model) => <td key={model.id}><div className="provider-list">{model.providers.map((provider) => <span key={provider}>{provider}</span>)}</div></td>)}</tr>
                </tbody>
              </table>
            </div>
            <p className="swipe-hint"><ArrowLeft size={13} /> Swipe table to compare all columns <ArrowRight size={13} /></p>
          </section>

          <section className="estimator-section" id="estimator">
            <div className="section-heading"><div><span className="eyebrow-label">PLAN YOUR SPEND</span><h2>Monthly cost estimator</h2><p>Adjust your expected usage to estimate API costs across your selected models.</p></div><span className="estimator-icon"><Zap size={19} /></span></div>
            <div className="estimator-layout">
              <div className="estimator-controls">
                <div className="token-control"><div className="token-label"><label htmlFor="input-tokens">Monthly prompt tokens</label><strong>{inputTokens.toLocaleString("en-US")}</strong></div><input id="input-tokens" type="range" min="0" max="50000000" step="250000" value={inputTokens} onChange={(event) => setInputTokens(Number(event.target.value))} /><div className="range-ends"><span>0</span><span>50M tokens</span></div><input className="number-input" aria-label="Monthly prompt tokens exact value" type="number" min="0" value={inputTokens} onChange={(event) => setInputTokens(Math.max(0, Number(event.target.value) || 0))} /></div>
                <div className="token-control"><div className="token-label"><label htmlFor="output-tokens">Monthly completion tokens</label><strong>{outputTokens.toLocaleString("en-US")}</strong></div><input id="output-tokens" type="range" min="0" max="10000000" step="100000" value={Math.min(outputTokens, 10000000)} onChange={(event) => setOutputTokens(Number(event.target.value))} /><div className="range-ends"><span>0</span><span>10M tokens</span></div><input className="number-input" aria-label="Monthly completion tokens exact value" type="number" min="0" value={outputTokens} onChange={(event) => setOutputTokens(Math.max(0, Number(event.target.value) || 0))} /></div>
              </div>
              <div className="cost-results"><div className="cost-results-heading"><span>ESTIMATED MONTHLY BILL</span><span>USD · Approximate</span></div>{[...costs].sort((a,b) => a.total-b.total).map((cost, index) => { const model = models.find((item) => item.id === cost.id); const next = [...costs].map((item) => item.total).filter((amount) => amount > cost.total).sort((a,b) => a-b)[0]; return <div className={`cost-result ${cost.total === lowestCost ? "best-cost" : ""}`} key={cost.id}><div className="cost-model"><BrandMark model={model} small /><span>{model.name}{cost.total === lowestCost && <small className="best-value"><Sparkles size={11} /> Best value</small>}</span></div><div className="cost-amount"><strong>{money(cost.total)}</strong>{cost.total === lowestCost && next !== undefined && <small>Saves {money(next - cost.total)}/mo</small>}</div></div>; })}<p className="cost-footnote">Estimates use listed per-million token rates only. Caching, discounts, taxes, and provider-specific fees may change actual bills.</p></div>
            </div>
          </section>
        </>}

        <footer className="compare-footer"><a className="compare-brand" href="/"><span className="compare-brand-icon"><AudioLines size={17} /></span><span>OneAtlas</span></a><span>Model data shown for interface demonstration.</span><a href="#top">Back to top ↑</a></footer>
      </main>
    </div>
  );
}

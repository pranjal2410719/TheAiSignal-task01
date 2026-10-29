"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  BrainCircuit,
  Calculator,
  Check,
  Columns,
  Copy,
  Info,
  LayoutDashboard,
  Menu,
  MoveHorizontal,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { HeroScreen } from "@/components/hero-screen";
import { CostCalculator } from "@/components/cost-calculator";
import { ModelDetails } from "@/components/model-details";
import { BrandLogo } from "@/components/brand-logo";
import { DEFAULT_MODEL_IDS, MAX_SELECTED_MODELS, MIN_SELECTED_MODELS, models } from "@/lib/models";
import type { ModelRecord } from "@/lib/types";
import { estimateMonthlyCost, parseModelSelection } from "@/lib/comparison";

function selectionFromSearch(search: string): string[] {
  return parseModelSelection(search, models.map((model) => model.id), DEFAULT_MODEL_IDS, MAX_SELECTED_MODELS);
}

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 3 });

const tokens = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`
    : `${Math.round(value / 1_000)}K`;

type DashboardView = "overview" | "compare" | "estimator" | "details" | "about";

interface ModelComparisonProps {
  basePath?: string;
  initialLaunched?: boolean;
}

export function ModelComparison({ basePath, initialLaunched = false }: ModelComparisonProps) {
  // If user opens URL with ?models= or visits /compare, launch workspace directly
  const [isLaunched, setIsLaunched] = useState<boolean>(initialLaunched);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_MODEL_IDS);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const urlInitialized = useRef(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const search = window.location.search;
      if (search && search.includes("models=")) {
        setIsLaunched(true);
      }
      setSelectedIds(selectionFromSearch(search));
      urlInitialized.current = true;
    });

    const onPopState = () => {
      urlInitialized.current = true;
      setSelectedIds(selectionFromSearch(window.location.search));
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!urlInitialized.current) return;
    const url = new URL(window.location.href);
    if (basePath && window.location.pathname !== basePath) {
      url.pathname = basePath;
    }
    url.searchParams.set("models", selectedIds.join(","));
    window.history.replaceState(null, "", url);
  }, [selectedIds, basePath]);

  const selectedModels = useMemo(() => {
    return selectedIds.flatMap((id) => {
      const model = models.find((candidate) => candidate.id === id);
      return model ? [model] : [];
    });
  }, [selectedIds]);

  const availableModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((model) => {
      const notSelected = !selectedIds.includes(model.id);
      if (!notSelected) return false;
      if (!q) return true;
      const haystack = `${model.name} ${model.lab} ${model.providers.join(" ")} ${model.id}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, selectedIds]);

  const updateSelection = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : current.length < MAX_SELECTED_MODELS
        ? [...current, id]
        : current
    );
  }, []);

  const shareLink = async () => {
    try {
      const shareUrl = new URL(window.location.href);
      shareUrl.pathname = "/compare";
      shareUrl.searchParams.set("models", selectedIds.join(","));
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this comparison URL:", window.location.href);
    }
  };

  const handleLaunch = (view: DashboardView = "overview") => {
    setIsLaunched(true);
    setActiveView(view);
  };

  // If on / and not launched, show full-screen hero
  if (!isLaunched) {
    return (
      <HeroScreen
        onLaunch={(tab) => {
          const viewMap: Record<string, DashboardView> = {
            compare: "compare",
            estimator: "estimator",
            details: "details",
            all: "overview",
          };
          handleLaunch(tab ? viewMap[tab] || "overview" : "overview");
        }}
      />
    );
  }

  // Derived metrics for KPIs
  const lowestInputModel = selectedModels.length
    ? selectedModels.reduce((prev, curr) => (curr.inputPricePerMillion < prev.inputPricePerMillion ? curr : prev))
    : null;
  const lowestOutputModel = selectedModels.length
    ? selectedModels.reduce((prev, curr) => (curr.outputPricePerMillion < prev.outputPricePerMillion ? curr : prev))
    : null;

  // Default calculation at 5M in / 1M out for KPI card
  const estimatedBills = selectedModels
    .map((m) => ({
      model: m,
      cost: estimateMonthlyCost(5_000_000, 1_000_000, m.inputPricePerMillion, m.outputPricePerMillion),
    }))
    .sort((a, b) => a.cost - b.cost);

  const cheapestBill = estimatedBills[0] || null;
  const secondCheapestBill = estimatedBills[1] || null;

  const lowestInputRate = lowestInputModel?.inputPricePerMillion ?? -1;
  const lowestOutputRate = lowestOutputModel?.outputPricePerMillion ?? -1;

  const rows: { label: string; value: (model: ModelRecord) => ReactNode }[] = [
    {
      label: "Context window",
      value: (model) => (
        <>
          <strong className="text-white text-sm block font-mono">{tokens(model.contextWindow)}</strong>
          <span className="muted text-[11px]">tokens</span>
        </>
      ),
    },
    {
      label: "Maximum output",
      value: (model) => (
        <>
          <strong className="text-white text-sm block font-mono">{tokens(model.maxOutput)}</strong>
          <span className="muted text-[11px]">tokens</span>
        </>
      ),
    },
    {
      label: "Input modalities",
      value: (model) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {model.inputModalities.map((item) => (
            <span className="pill text-[10px]" key={item}>
              {item}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Output modalities",
      value: (model) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {model.outputModalities.map((item) => (
            <span className="pill text-[10px]" key={item}>
              {item}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Input price / 1M",
      value: (model) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <strong className="text-white text-sm font-mono">{money(model.inputPricePerMillion)}</strong>
          {model.inputPricePerMillion === lowestInputRate && <span className="badge badge-emerald">Lowest</span>}
        </div>
      ),
    },
    {
      label: "Output price / 1M",
      value: (model) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <strong className="text-white text-sm font-mono">{money(model.outputPricePerMillion)}</strong>
          {model.outputPricePerMillion === lowestOutputRate && <span className="badge badge-emerald">Lowest</span>}
        </div>
      ),
    },
    {
      label: "Intelligence benchmark",
      value: (model) => (
        <div className="min-w-[120px] max-w-[180px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-white font-mono">{model.intelligenceScore.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">/ 60</span>
          </div>
          <div className="benchmark-bar">
            <div
              className="benchmark-progress"
              style={{ width: `${Math.min(100, (model.intelligenceScore / 60) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Coding benchmark",
      value: (model) => (
        <div className="min-w-[120px] max-w-[180px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-white font-mono">{model.codingScore.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">/ 60</span>
          </div>
          <div className="benchmark-bar">
            <div
              className="benchmark-progress benchmark-progress-sky"
              style={{ width: `${Math.min(100, (model.codingScore / 60) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Agentic benchmark",
      value: (model) => (
        <div className="min-w-[120px] max-w-[180px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-white font-mono">{model.agenticScore.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">/ 60</span>
          </div>
          <div className="benchmark-bar">
            <div
              className="benchmark-progress benchmark-progress-purple"
              style={{ width: `${Math.min(100, (model.agenticScore / 60) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Open weights",
      value: (model) => (
        <span
          className={`pill text-[11px] font-medium ${
            model.weights === "Open" ? "text-emerald-300 border-emerald-500/30 bg-emerald-950/30" : "text-slate-300"
          }`}
        >
          {model.weights}
        </span>
      ),
    },
    {
      label: "Active providers",
      value: (model) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {model.providers.map((provider) => (
            <span className="pill text-[10px]" key={provider}>
              {provider}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Release date",
      value: (model) => <span className="text-xs text-slate-300 whitespace-nowrap">{model.releaseDate}</span>,
    },
  ];

  const hasMinModels = selectedModels.length >= MIN_SELECTED_MODELS;

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* DASHBOARD SIDEBAR NAVIGATION */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""}`}>
        {/* Brand header */}
        <div className="sidebar-header">
          <BrandLogo />
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="sidebar-nav-section">
          <span className="sidebar-section-title">Navigation</span>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setActiveView("overview");
                setSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeView === "overview" ? "sidebar-nav-item-active" : ""}`}
            >
              <LayoutDashboard size={16} className="shrink-0" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("compare");
                setSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeView === "compare" ? "sidebar-nav-item-active" : ""}`}
            >
              <Columns size={16} className="shrink-0" />
              <span>Compare Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("estimator");
                setSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeView === "estimator" ? "sidebar-nav-item-active" : ""}`}
            >
              <Calculator size={16} className="shrink-0" />
              <span>Cost Estimator</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("details");
                setSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeView === "details" ? "sidebar-nav-item-active" : ""}`}
            >
              <BrainCircuit size={16} className="shrink-0" />
              <span>Model Details</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("about");
                setSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeView === "about" ? "sidebar-nav-item-active" : ""}`}
            >
              <Info size={16} className="shrink-0" />
              <span>About & Methodology</span>
            </button>
          </nav>
        </div>

        {/* Quick Selection in Sidebar */}
        <div className="sidebar-selection-section">
          <div className="flex items-center justify-between mb-2">
            <span className="sidebar-section-title">Active Models</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {selectedModels.length}/{MAX_SELECTED_MODELS}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {selectedModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-white"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-slate-200">{model.name}</strong>
                  <span className="text-[10px] text-slate-400">{model.lab}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelection(model.id)}
                  aria-label={`Remove ${model.name}`}
                  className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedModels.length === 0 && (
              <p className="text-xs text-slate-500 italic p-2">No models selected.</p>
            )}
          </div>

          {availableModels.length > 0 && selectedIds.length < MAX_SELECTED_MODELS && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1.5">Add candidate:</span>
              <div className="flex flex-wrap gap-1">
                {availableModels.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateSelection(m.id)}
                    className="text-[10px] py-1 px-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40"
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>OneAtlas Dark Theme</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Assessment Catalog Demo
          </span>
        </div>
      </aside>

      {/* DASHBOARD MAIN CONTENT */}
      <div className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 m-0">
                <span>Model Intelligence Dashboard</span>
                <span className="pill text-[10px] hidden sm:inline-block font-mono">
                  {activeView.toUpperCase()}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={shareLink}
              className="btn btn-share text-xs py-1.5 px-3"
              aria-label="Share comparison workspace URL"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              <span>{copied ? "Link Copied!" : "Share URL"}</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="dashboard-content">
          {/* TOP KPI CARDS */}
          <div className="dashboard-kpi-grid">
            {/* KPI 1: Active Models */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Selected Set</span>
                <span className="pill text-[10px] text-emerald-400 border-emerald-500/20">
                  {hasMinModels ? "Valid Set" : "Need >= 2"}
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {selectedModels.length}
                </span>
                <span className="text-xs text-slate-400 font-mono"> / {MAX_SELECTED_MODELS} models</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {selectedModels.map((m) => m.name).join(", ") || "None"}
              </span>
            </div>

            {/* KPI 2: Lowest Input Rate */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Lowest Input Rate</span>
                <Zap size={13} className="text-emerald-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {lowestInputModel ? money(lowestInputModel.inputPricePerMillion) : "$0.00"}
                </span>
                <span className="text-xs text-slate-400"> / 1M</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium truncate">
                {lowestInputModel ? `${lowestInputModel.name} (${lowestInputModel.lab})` : "—"}
              </span>
            </div>

            {/* KPI 3: Lowest Output Rate */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Lowest Output Rate</span>
                <Zap size={13} className="text-sky-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {lowestOutputModel ? money(lowestOutputModel.outputPricePerMillion) : "$0.00"}
                </span>
                <span className="text-xs text-slate-400"> / 1M</span>
              </div>
              <span className="text-[11px] text-sky-400 font-medium truncate">
                {lowestOutputModel ? `${lowestOutputModel.name} (${lowestOutputModel.lab})` : "—"}
              </span>
            </div>

            {/* KPI 4: Best Value Bill */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cheapest Monthly Bill</span>
                <Sparkles size={13} className="text-emerald-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                  {cheapestBill ? money(cheapestBill.cost) : "$0.00"}
                </span>
                <span className="text-xs text-slate-400"> / mo</span>
              </div>
              <span className="text-[11px] text-slate-300 truncate">
                {cheapestBill && secondCheapestBill
                  ? `Saves ${money(secondCheapestBill.cost - cheapestBill.cost)} vs ${secondCheapestBill.model.name}`
                  : cheapestBill
                  ? cheapestBill.model.name
                  : "5M in · 1M out standard"}
              </span>
            </div>
          </div>

          {/* Model Selector Bar */}
          <div className="panel p-4 sm:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="kicker">SEARCH & FILTER</p>
                <h2 className="text-base font-bold text-white">Select Models to Compare</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {selectedModels.length}/{MAX_SELECTED_MODELS} active
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="picker">
              <label className="sr-only" htmlFor="model-search">
                Search models or providers
              </label>
              <div className="relative flex-1 min-w-[220px] w-full flex items-center">
                <Search size={16} className="text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
                <input
                  id="model-search"
                  className="field search-field pl-9 pr-14 w-full text-xs sm:text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search model name, lab, or provider..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                    aria-label="Clear search query"
                  >
                    Clear
                  </button>
                )}
              </div>
              <span className="muted text-xs whitespace-nowrap shrink-0">
                {availableModels.length} candidates available
              </span>
            </div>

            {/* Selected Model Chips */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="selection-row">
                {selectedModels.map((model) => (
                  <span className="chip" key={model.id}>
                    <span className="chip-indicator" />
                    <strong className="text-xs sm:text-sm">{model.name}</strong>
                    <span className="text-slate-400 text-[11px]">({model.lab})</span>
                    <button
                      type="button"
                      aria-label={`Remove ${model.name}`}
                      onClick={() => updateSelection(model.id)}
                      className="chip-remove-btn"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                {selectedModels.length === 0 && (
                  <span className="text-xs text-slate-400 italic py-1">
                    No models selected. Choose from the candidates below or search above.
                  </span>
                )}
              </div>
            </div>

            {/* Available Model Buttons */}
            {availableModels.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  + Add model to comparison
                </span>
                <div className="model-options">
                  {availableModels.map((model) => (
                    <button
                      className="model-option"
                      type="button"
                      key={model.id}
                      disabled={selectedIds.length >= MAX_SELECTED_MODELS}
                      onClick={() => updateSelection(model.id)}
                    >
                      <span className="text-emerald-400 font-bold">+</span>
                      <span>{model.name}</span>
                      <span className="muted text-[11px]">· {model.lab}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!hasMinModels && (
            <div className="notice mb-6">
              <strong>Minimum selection required:</strong> Select at least two models to view the technical comparison matrix and cost estimator. You can select up to four models.
            </div>
          )}

          {/* DYNAMIC VIEW ROUTING BASED ON SIDEBAR */}
          {hasMinModels && (
            <div className="space-y-8">
              {/* VIEW: OVERVIEW (Full Dashboard Snapshot) */}
              {activeView === "overview" && (
                <>
                  {/* Summary Cards */}
                  <section className="space-y-4">
                    <div className="section-heading mb-2">
                      <div>
                        <p className="kicker">OVERVIEW SNAPSHOT</p>
                        <h2 className="text-xl font-bold text-white">Model Comparison Summary</h2>
                      </div>
                      <span className="pill text-xs font-mono text-emerald-400 border-emerald-500/20 bg-emerald-950/30">
                        {selectedModels.length} models selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedModels.map((model) => {
                        const isLowestIn = model.inputPricePerMillion === lowestInputRate;
                        const isLowestOut = model.outputPricePerMillion === lowestOutputRate;
                        return (
                          <div className="summary-card" key={model.id}>
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                                  {model.name}
                                </h3>
                                <span className="text-xs text-slate-400 block">{model.lab}</span>
                              </div>
                              <span className="pill text-[10px] shrink-0">{model.weights}</span>
                            </div>

                            <div className="summary-price-box">
                              <div className="mb-2">
                                <span className="text-[11px] text-slate-400 block">Input rate</span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                                    {money(model.inputPricePerMillion)}
                                  </span>
                                  <span className="text-xs text-slate-400">/ 1M</span>
                                  {isLowestIn && <span className="badge badge-emerald shrink-0">Lowest</span>}
                                </div>
                              </div>

                              <div>
                                <span className="text-[11px] text-slate-400 block">Output rate</span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-base sm:text-lg font-semibold font-mono text-slate-200">
                                    {money(model.outputPricePerMillion)}
                                  </span>
                                  <span className="text-xs text-slate-400">/ 1M</span>
                                  {isLowestOut && <span className="badge badge-emerald shrink-0">Lowest</span>}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                              <div className="flex justify-between text-slate-400">
                                <span>Context Window:</span>
                                <strong className="text-slate-200 font-mono">{tokens(model.contextWindow)}</strong>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Coding Score:</span>
                                <strong className="text-sky-300 font-mono">{model.codingScore.toFixed(1)} / 60</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Matrix Widget */}
                  <section className="space-y-3">
                    <div className="section-heading mb-2">
                      <div>
                        <p className="kicker">SPECIFICATIONS MATRIX</p>
                        <h2 className="text-xl font-bold text-white">Side-by-Side Technical Comparison</h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 md:hidden bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        <MoveHorizontal size={14} className="text-emerald-400 shrink-0" />
                        <span>Swipe sideways</span>
                      </div>
                    </div>

                    <div className="table-wrap" role="region" aria-label="Model comparison table" tabIndex={0}>
                      <table>
                        <thead>
                          <tr>
                            <th scope="col" className="spec-header-col">Specification</th>
                            {selectedModels.map((model) => (
                              <th scope="col" key={model.id} className="min-w-[170px]">
                                <strong className="block text-white text-sm font-semibold">{model.name}</strong>
                                <span className="muted block mt-0.5 text-xs">{model.lab}</span>
                                <span className="text-slate-500 block mt-1.5 text-[11px]">
                                  Released: {model.releaseDate}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.label}>
                              <th scope="row" className="spec-header-col">{row.label}</th>
                              {selectedModels.map((model) => (
                                <td key={model.id}>{row.value(model)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Cost Estimator Widget */}
                  <section className="space-y-3">
                    <div className="section-heading mb-2">
                      <div>
                        <p className="kicker">USAGE BILL PROJECTION</p>
                        <h2 className="text-xl font-bold text-white">Interactive Cost Calculator</h2>
                      </div>
                    </div>
                    <CostCalculator selectedModels={selectedModels} />
                  </section>
                </>
              )}

              {/* VIEW: COMPARE ONLY */}
              {activeView === "compare" && (
                <section className="space-y-4">
                  <div className="section-heading mb-4">
                    <div>
                      <p className="kicker">FULL MATRIX</p>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Technical Comparison Matrix</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Inspect specifications, benchmarks, modalities, and price highlights side by side.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 md:hidden bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      <MoveHorizontal size={14} className="text-emerald-400 shrink-0" />
                      <span>Swipe sideways</span>
                    </div>
                  </div>

                  <div className="table-wrap" role="region" aria-label="Model comparison table" tabIndex={0}>
                    <table>
                      <thead>
                        <tr>
                          <th scope="col" className="spec-header-col">Specification</th>
                          {selectedModels.map((model) => (
                            <th scope="col" key={model.id} className="min-w-[170px]">
                              <strong className="block text-white text-sm font-semibold">{model.name}</strong>
                              <span className="muted block mt-0.5 text-xs">{model.lab}</span>
                              <span className="text-slate-500 block mt-1.5 text-[11px]">
                                Released: {model.releaseDate}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.label}>
                            <th scope="row" className="spec-header-col">{row.label}</th>
                            {selectedModels.map((model) => (
                              <td key={model.id}>{row.value(model)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* VIEW: ESTIMATOR ONLY */}
              {activeView === "estimator" && (
                <section className="space-y-4">
                  <div className="section-heading mb-4">
                    <div>
                      <p className="kicker">FINANCIAL ESTIMATION</p>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Monthly API Cost Estimator</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Adjust token volume controls or pick quick workload presets to simulate monthly spend.
                      </p>
                    </div>
                  </div>
                  <CostCalculator selectedModels={selectedModels} />
                </section>
              )}

              {/* VIEW: DETAILS ONLY */}
              {activeView === "details" && (
                <section>
                  <ModelDetails selectedModels={selectedModels} />
                </section>
              )}

              {/* VIEW: ABOUT & METHODOLOGY */}
              {activeView === "about" && (
                <section className="panel p-6 sm:p-8 space-y-4 max-w-3xl">
                  <p className="kicker">ASSESSMENT METHODOLOGY</p>
                  <h2 className="text-2xl font-bold text-white">Make the assumptions visible.</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    The comparison experience uses an illustrative local catalog. Prices, provider listings, release dates, and benchmark scores are demonstration data designed for this Frontend Engineering Assessment, not verified live provider feeds.
                  </p>
                  <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                    <p>• <strong>Stack</strong>: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.</p>
                    <p>• <strong>Theme</strong>: OneAtlas dark design system with charcoal panels and emerald accents.</p>
                    <p>• <strong>URL State</strong>: Active selection synchronizes to <code>/compare?models=...</code> via <code>history.replaceState</code>.</p>
                    <p>• <strong>Cost Formula</strong>: <code>(input ÷ 1M × input rate) + (output ÷ 1M × output rate)</code>.</p>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Disclaimer & Footer */}
          <aside className="notice my-8">
            <strong>Data limitations & disclaimer:</strong> All model records, prices, benchmark scores, and provider lists are illustrative assessment sample data. Verify current provider specifications before production reliance.
          </aside>

          <footer className="footer">
            <BrandLogo />
            <span className="text-center sm:text-left text-xs text-slate-400">
              Built for The AI Signal Frontend Engineering Assessment · Next.js 16 + React 19 + Tailwind CSS 4
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-emerald-300 text-xs whitespace-nowrap bg-transparent border-0 cursor-pointer p-0 text-slate-400"
            >
              Back to top ↑
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

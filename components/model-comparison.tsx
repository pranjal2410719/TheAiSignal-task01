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
  LayoutGrid,
  Menu,
  MoveHorizontal,
  Search,
  Sparkles,
  Table as TableIcon,
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

// Toggle chips definition per design.md §6.5
const TOGGLE_CHIPS = [
  { id: "reasoning", label: "Reasoning" },
  { id: "tools", label: "Tool calling" },
  { id: "json", label: "Structured output" },
  { id: "vision", label: "Vision" },
  { id: "open-weights", label: "Open weights" },
  { id: "1m-context", label: "1M+ context" },
  { id: "free", label: "Free" },
];

interface ModelComparisonProps {
  basePath?: string;
  initialLaunched?: boolean;
}

export function ModelComparison({ basePath, initialLaunched = false }: ModelComparisonProps) {
  const [isLaunched, setIsLaunched] = useState<boolean>(initialLaunched);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_MODEL_IDS);
  const [query, setQuery] = useState("");
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [selectedLab, setSelectedLab] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const urlInitialized = useRef(false);

  // Sync URL on initial mount and popstate
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

  // Keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((open) => !open);
      } else if (e.key === "Escape") {
        setCmdkOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update browser URL query params
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

  // Unique AI Labs for filter dropdown
  const labOptions = useMemo(() => {
    const labs = Array.from(new Set(models.map((m) => m.lab)));
    return labs.map((lab) => ({
      name: lab,
      count: models.filter((m) => m.lab === lab).length,
    }));
  }, []);

  const toggleChip = (chipId: string) => {
    setActiveChips((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    );
  };

  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((model) => {
      // Lab filter
      if (selectedLab !== "all" && model.lab !== selectedLab) return false;

      // Text query
      if (q) {
        const haystack = `${model.name} ${model.lab} ${model.providers.join(" ")} ${model.id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Capability toggle chips
      if (activeChips.includes("open-weights") && model.weights !== "Open") return false;
      if (activeChips.includes("1m-context") && model.contextWindow < 1_000_000) return false;
      if (activeChips.includes("vision") && !model.inputModalities.includes("Image")) return false;
      if (activeChips.includes("free") && (model.inputPricePerMillion > 0 || model.outputPricePerMillion > 0)) return false;

      return true;
    });
  }, [query, selectedLab, activeChips]);

  const availableModels = useMemo(() => {
    return filteredModels.filter((model) => !selectedIds.includes(model.id));
  }, [filteredModels, selectedIds]);

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
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  // Cheapest and lowest price evaluations
  const lowestInputModel = useMemo(() => {
    if (selectedModels.length === 0) return null;
    return [...selectedModels].sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)[0];
  }, [selectedModels]);

  const lowestOutputModel = useMemo(() => {
    if (selectedModels.length === 0) return null;
    return [...selectedModels].sort((a, b) => a.outputPricePerMillion - b.outputPricePerMillion)[0];
  }, [selectedModels]);

  const rankedBills = useMemo(() => {
    return selectedModels
      .map((model) => ({
        model,
        cost: estimateMonthlyCost(5_000_000, 1_000_000, model.inputPricePerMillion, model.outputPricePerMillion),
      }))
      .sort((a, b) => a.cost - b.cost);
  }, [selectedModels]);

  const cheapestBill = rankedBills[0];
  const secondCheapestBill = rankedBills[1];
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

  // Render Full-Screen Intro on / when not launched yet
  if (!isLaunched) {
    return (
      <HeroScreen
        onLaunch={(view = "compare") => {
          setIsLaunched(true);
          setActiveView(view === "all" ? "overview" : view);
        }}
      />
    );
  }

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
              <span>Model Deep Dive</span>
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
              <span>Methodology</span>
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

          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {selectedModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-[#141a1f] border border-[#232c33] text-xs text-white"
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
            <div className="mt-3 pt-3 border-t border-[#232c33]">
              <span className="text-[11px] text-slate-400 block mb-1.5">Add candidate:</span>
              <div className="flex flex-wrap gap-1">
                {availableModels.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateSelection(m.id)}
                    className="text-[10px] py-1 px-2 rounded bg-[#141a1f] border border-[#232c33] text-slate-300 hover:text-white hover:border-emerald-500/40"
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
            Next.js 16 App Router · React 19
          </span>
        </div>
      </aside>

      {/* DASHBOARD MAIN CONTENT */}
      <div className="dashboard-main">
        {/* TOPBAR (Height 56px sticky, matching design.md §6.1) */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg bg-[#141a1f] border border-[#232c33] text-slate-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 m-0">
                <span>OneAtlas</span>
                <span className="text-slate-500 font-normal text-xs hidden sm:inline">/</span>
                <span className="text-slate-300 text-xs sm:text-sm font-medium hidden sm:inline">
                  {activeView === "overview" && "Models Overview"}
                  {activeView === "compare" && "Comparison Matrix"}
                  {activeView === "estimator" && "Cost Estimator"}
                  {activeView === "details" && "Model Deep Dive"}
                  {activeView === "about" && "Methodology"}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Trigger (⌘K) per design.md §6.1 */}
            <button
              type="button"
              onClick={() => setCmdkOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141a1f] border border-[#232c33] text-xs text-slate-400 hover:text-white hover:border-[#2f3a42] transition-colors"
              aria-label="Search models (Press ⌘K)"
            >
              <Search size={14} className="text-slate-500" />
              <span>Search models, labs, providers...</span>
              <kbd className="text-[10px] bg-[#1a2127] border border-[#232c33] px-1.5 py-0.5 rounded text-slate-400 font-mono">⌘K</kbd>
            </button>

            {/* Share URL Button */}
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
        <main className="dashboard-content" id="main">
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

          {/* 6.5 Filter Bar & Toggle Chips per design.md */}
          <div className="panel p-4 sm:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="kicker">FILTER & SELECT</p>
                <h2 className="text-base font-bold text-white">Model Catalog & Selection</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {filteredModels.length} models match
                </span>
                {/* Segmented View Toggle (Table | Cards) */}
                <div className="segmented-control" role="group" aria-label="View layout switch">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`segmented-btn ${viewMode === "table" ? "segmented-btn-active" : ""}`}
                    aria-label="Table view"
                  >
                    <TableIcon size={13} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`segmented-btn ${viewMode === "cards" ? "segmented-btn-active" : ""}`}
                    aria-label="Cards view"
                  >
                    <LayoutGrid size={13} />
                    <span>Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Search text field */}
              <div className="sm:col-span-8 relative flex items-center">
                <Search size={15} className="text-slate-500 absolute left-3 pointer-events-none" aria-hidden="true" />
                <input
                  id="model-search"
                  className="field search-field pl-9 pr-14 w-full text-xs sm:text-sm bg-[#1a2127] border-[#2f3a42]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by model, lab, or provider..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-[#222b32]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Lab select combobox */}
              <div className="sm:col-span-4">
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1a2127] border border-[#2f3a42] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  aria-label="Filter by Lab"
                >
                  <option value="all">All Labs ({models.length})</option>
                  {labOptions.map((opt) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.name} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6.5 Toggle Chips per design.md */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#232c33]">
              {TOGGLE_CHIPS.map((chip) => {
                const isActive = activeChips.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleChip(chip.id)}
                    className={`filter-chip ${isActive ? "filter-chip-active" : ""}`}
                  >
                    {isActive && <Check size={12} className="text-emerald-400" />}
                    <span>{chip.label}</span>
                  </button>
                );
              })}
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChips([])}
                  className="text-xs text-slate-500 hover:text-slate-300 ml-1 py-1"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Active Model Chips */}
            <div className="mt-3 pt-3 border-t border-[#232c33]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Active Comparison ({selectedModels.length}/{MAX_SELECTED_MODELS}):
                </span>
                {selectedModels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>

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
                    No models selected. Choose from the candidates below.
                  </span>
                )}
              </div>
            </div>

            {/* Quick Candidate Buttons */}
            {availableModels.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#232c33]">
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

          {/* DYNAMIC VIEW ROUTING BASED ON VIEW OR SEGMENTED MODE */}
          {hasMinModels && (
            <div className="space-y-8">
              {/* OVERVIEW / CARDS MODE */}
              {(activeView === "overview" || viewMode === "cards") && viewMode === "cards" && (
                <section className="space-y-4">
                  <div className="section-heading mb-2">
                    <div>
                      <p className="kicker">CARD VIEW</p>
                      <h2 className="text-xl font-bold text-white">Model Cards Grid</h2>
                    </div>
                  </div>

                  {/* 6.7 Cards View per design.md */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedModels.map((model) => (
                      <div
                        key={model.id}
                        className="p-4 rounded-xl border border-[#232c33] bg-[#141a1f] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-emerald-400">{model.lab}</span>
                            <span className="pill text-[10px]">{model.weights}</span>
                          </div>
                          <h3 className="text-base font-bold text-white mb-1">{model.name}</h3>
                          <p className="text-[11px] text-slate-500 font-mono mb-4">Released {model.releaseDate}</p>

                          {/* 2x3 Stat grid per design.md §6.7 */}
                          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#1a2127] border border-[#232c33] text-xs mb-3">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Context</span>
                              <strong className="text-slate-200 font-mono">{tokens(model.contextWindow)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Output</span>
                              <strong className="text-slate-200 font-mono">{tokens(model.maxOutput)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Input / 1M</span>
                              <strong className="text-emerald-400 font-mono">{money(model.inputPricePerMillion)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Output / 1M</span>
                              <strong className="text-slate-200 font-mono">{money(model.outputPricePerMillion)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Intelligence</span>
                              <strong className="text-slate-200 font-mono">{model.intelligenceScore.toFixed(1)}/60</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Coding</span>
                              <strong className="text-sky-300 font-mono">{model.codingScore.toFixed(1)}/60</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#232c33] flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">{model.providers.length} providers</span>
                          <button
                            type="button"
                            onClick={() => updateSelection(model.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* OVERVIEW (Full Dashboard Snapshot) */}
              {activeView === "overview" && viewMode === "table" && (
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

                            <div className="mt-3 pt-3 border-t border-[#232c33] text-xs space-y-1.5">
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
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 md:hidden bg-[#141a1f] px-2.5 py-1 rounded border border-[#232c33]">
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 md:hidden bg-[#141a1f] px-2.5 py-1 rounded border border-[#232c33]">
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

                  <div className="pt-6">
                    <CostCalculator selectedModels={selectedModels} />
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
                  <div className="pt-4 border-t border-[#232c33] space-y-2 text-xs text-slate-400">
                    <p>• <strong>Stack</strong>: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.</p>
                    <p>• <strong>Theme</strong>: OneAtlas Dark design system per <code>design.md</code> spec.</p>
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
              Every AI model, side by side. · OneAtlas Dark Specification · Updated Oct 27, 2026
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

      {/* COMMAND PALETTE (⌘K) MODAL per design.md §6.9 */}
      {cmdkOpen && (
        <div
          className="cmdk-backdrop"
          onClick={() => setCmdkOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="cmdk-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-[#232c33] flex items-center gap-2.5">
              <Search size={16} className="text-emerald-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models, labs, providers... (Press Esc to close)"
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <kbd className="text-[10px] bg-[#141a1f] border border-[#232c33] px-1.5 py-0.5 rounded text-slate-400 font-mono">
                ESC
              </kbd>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1 block">
                Models ({filteredModels.length})
              </span>
              <div className="space-y-1">
                {filteredModels.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        updateSelection(m.id);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-950/40 border border-emerald-500/30 text-white"
                          : "hover:bg-[#141a1f] text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-semibold">{m.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">({m.lab})</span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          {money(m.inputPricePerMillion)} in / {money(m.outputPricePerMillion)} out · {tokens(m.contextWindow)} ctx
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">
                        {isSelected ? "Remove" : "+ Compare"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Moon,
  MoveHorizontal,
  Search,
  Sparkles,
  Sun,
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

const labColors: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#4285f4",
  DeepSeek: "#4d6bfe",
  Meta: "#0866ff",
};

const MOD_ICON: Record<string, string> = {
  Text: "T",
  Image: "◐",
  Audio: "♪",
  Video: "▶",
  PDF: "▤",
};

type DashboardView = "overview" | "compare" | "estimator" | "details" | "about";

const TOGGLE_CHIPS = [
  { id: "reasoning", label: "Reasoning" },
  { id: "tools", label: "Tools" },
  { id: "vision", label: "Vision" },
  { id: "open-weights", label: "Open weights" },
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
  const [dark, setDark] = useState<boolean>(false);
  const urlInitialized = useRef(false);

  // Sync dark class to document element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
      if (selectedLab !== "all" && model.lab !== selectedLab) return false;
      if (q) {
        const haystack = `${model.name} ${model.lab} ${model.providers.join(" ")} ${model.id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeChips.includes("open-weights") && model.weights !== "Open") return false;
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
          <strong className="text-ink text-sm block mono">{tokens(model.contextWindow)}</strong>
          <span className="text-muted text-[11px]">tokens</span>
        </>
      ),
    },
    {
      label: "Maximum output",
      value: (model) => (
        <>
          <strong className="text-ink text-sm block mono">{tokens(model.maxOutput)}</strong>
          <span className="text-muted text-[11px]">tokens</span>
        </>
      ),
    },
    {
      label: "Input modalities",
      value: (model) => (
        <div className="flex items-center gap-1">
          {model.inputModalities.map((item) => (
            <span key={item} title={`${item} in`} className="mod-glyph">
              {MOD_ICON[item] ?? item[0]}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Output modalities",
      value: (model) => (
        <div className="flex items-center gap-1">
          {model.outputModalities.map((item) => (
            <span key={item} title={`${item} out`} className="mod-glyph border border-line">
              {MOD_ICON[item] ?? item[0]}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Input price / 1M",
      value: (model) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <strong className="text-ink text-sm mono">{money(model.inputPricePerMillion)}</strong>
          {model.inputPricePerMillion === lowestInputRate && <span className="badge-lowest">Lowest</span>}
        </div>
      ),
    },
    {
      label: "Output price / 1M",
      value: (model) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <strong className="text-ink text-sm mono">{money(model.outputPricePerMillion)}</strong>
          {model.outputPricePerMillion === lowestOutputRate && <span className="badge-lowest">Lowest</span>}
        </div>
      ),
    },
    {
      label: "Intelligence benchmark",
      value: (model) => (
        <div className="min-w-[130px] max-w-[190px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-ink mono">{model.intelligenceScore.toFixed(1)}</strong>
            <span className="text-muted text-[10px]">/ 60</span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${Math.min(100, (model.intelligenceScore / 60) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Coding benchmark",
      value: (model) => (
        <div className="min-w-[130px] max-w-[190px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-ink mono">{model.codingScore.toFixed(1)}</strong>
            <span className="text-muted text-[10px]">/ 60</span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${Math.min(100, (model.codingScore / 60) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Agentic benchmark",
      value: (model) => (
        <div className="min-w-[130px] max-w-[190px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="text-ink mono">{model.agenticScore.toFixed(1)}</strong>
            <span className="text-muted text-[10px]">/ 60</span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
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
          className={`chip ${
            model.weights === "Open" ? "bg-[var(--tile-olive)]/60 text-[#2d3a12]" : ""
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
            <span className="chip" key={provider}>
              {provider}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Release date",
      value: (model) => <span className="text-xs text-muted whitespace-nowrap">{model.releaseDate}</span>,
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
        <div className="sidebar-header">
          <BrandLogo />
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-ink cursor-pointer bg-transparent border-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

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
              <span>Model Profiles</span>
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

        {/* Quick Selection Drawer in Sidebar */}
        <div className="sidebar-selection-section">
          <div className="flex items-center justify-between mb-2">
            <span className="sidebar-section-title">Selected Models</span>
            <span className="mono text-xs font-semibold text-ink">
              {selectedModels.length}/{MAX_SELECTED_MODELS}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
            {selectedModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-sunken border border-line text-xs text-ink"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-semibold text-white"
                    style={{ background: labColors[model.lab] || "#6b6a64" }}
                  >
                    {model.lab[0]}
                  </span>
                  <div className="min-w-0 truncate">
                    <strong className="block truncate">{model.name}</strong>
                    <span className="text-[10px] text-muted">{model.lab}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelection(model.id)}
                  aria-label={`Remove ${model.name}`}
                  className="p-1 text-muted hover:text-red-500 rounded cursor-pointer bg-transparent border-none"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedModels.length === 0 && (
              <p className="text-xs text-muted italic p-2">No models selected.</p>
            )}
          </div>

          {availableModels.length > 0 && selectedIds.length < MAX_SELECTED_MODELS && (
            <div className="mt-3 pt-3 border-t border-line">
              <span className="text-[11px] text-muted block mb-1.5">Add candidate:</span>
              <div className="flex flex-wrap gap-1">
                {availableModels.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateSelection(m.id)}
                    className="text-[10px] py-1 px-2 rounded bg-surface border border-line text-ink hover:bg-sunken cursor-pointer"
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted">Theme Palette</span>
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className="grid h-6 w-6 place-items-center rounded border border-line text-muted hover:text-ink cursor-pointer bg-transparent"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </div>
        </div>
      </aside>

      {/* DASHBOARD MAIN CONTENT */}
      <div className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg bg-surface border border-line text-ink cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">
                {activeView === "overview" && "Models Overview"}
                {activeView === "compare" && "Comparison Matrix"}
                {activeView === "estimator" && "Cost Estimator"}
                {activeView === "details" && "Model Profiles"}
                {activeView === "about" && "Methodology"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ⌘K Search Trigger */}
            <button
              type="button"
              onClick={() => setCmdkOpen(true)}
              className="field cursor-pointer text-left text-[0.82rem] text-muted hidden sm:flex w-64"
            >
              <Search size={14} className="text-muted" />
              <span className="min-w-0 flex-1 truncate">Search models, labs...</span>
              <span className="kbd">⌘K</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink cursor-pointer bg-surface"
              aria-label="Toggle dark mode"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Share URL */}
            <button
              type="button"
              onClick={shareLink}
              className="btn btn-ink text-xs py-1.5 px-3 h-9"
              aria-label="Share comparison URL"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Share URL"}</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="dashboard-content" id="main">
          {/* TOP KPI CARDS */}
          <div className="dashboard-kpi-grid">
            {/* KPI 1: Active Models */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Selected Models</span>
                <span className="chip">
                  {hasMinModels ? "Valid Set" : "Need >= 2"}
                </span>
              </div>
              <div className="my-2">
                <span className="serif text-3xl font-medium text-ink mono">
                  {selectedModels.length}
                </span>
                <span className="text-xs text-muted mono"> / {MAX_SELECTED_MODELS}</span>
              </div>
              <span className="text-[11px] text-muted truncate">
                {selectedModels.map((m) => m.name).join(", ") || "None"}
              </span>
            </div>

            {/* KPI 2: Lowest Input Rate */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Lowest Input Rate</span>
                <Zap size={13} className="text-accent" />
              </div>
              <div className="my-2">
                <span className="serif text-3xl font-medium text-ink mono">
                  {lowestInputModel ? money(lowestInputModel.inputPricePerMillion) : "$0.00"}
                </span>
                <span className="text-xs text-muted"> / 1M</span>
              </div>
              <span className="text-[11px] text-muted font-medium truncate">
                {lowestInputModel ? `${lowestInputModel.name} (${lowestInputModel.lab})` : "—"}
              </span>
            </div>

            {/* KPI 3: Lowest Output Rate */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Lowest Output Rate</span>
                <Zap size={13} className="text-accent" />
              </div>
              <div className="my-2">
                <span className="serif text-3xl font-medium text-ink mono">
                  {lowestOutputModel ? money(lowestOutputModel.outputPricePerMillion) : "$0.00"}
                </span>
                <span className="text-xs text-muted"> / 1M</span>
              </div>
              <span className="text-[11px] text-muted font-medium truncate">
                {lowestOutputModel ? `${lowestOutputModel.name} (${lowestOutputModel.lab})` : "—"}
              </span>
            </div>

            {/* KPI 4: Best Value Bill */}
            <div className="dashboard-kpi-card">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Cheapest Monthly Bill</span>
                <Sparkles size={13} className="text-accent" />
              </div>
              <div className="my-2">
                <span className="serif text-3xl font-medium text-ink mono">
                  {cheapestBill ? money(cheapestBill.cost) : "$0.00"}
                </span>
                <span className="text-xs text-muted"> / mo</span>
              </div>
              <span className="text-[11px] text-muted truncate">
                {cheapestBill && secondCheapestBill
                  ? `Saves ${money(secondCheapestBill.cost - cheapestBill.cost)} vs ${secondCheapestBill.model.name}`
                  : cheapestBill
                  ? cheapestBill.model.name
                  : "5M in · 1M out standard"}
              </span>
            </div>
          </div>

          {/* Filter Bar & Model Selector */}
          <div className="p-5 rounded-2xl border border-line bg-surface mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted">FILTER & SELECT</p>
                <h2 className="serif text-xl font-medium text-ink">Model Catalog & Selection</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted mono">
                  {filteredModels.length} models match
                </span>
                {/* Segmented Table | Cards switch */}
                <div className="flex items-center border border-line rounded-lg p-0.5 bg-sunken">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer border-none ${
                      viewMode === "table" ? "bg-surface text-ink shadow-xs" : "bg-transparent text-muted"
                    }`}
                  >
                    <TableIcon size={12} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer border-none ${
                      viewMode === "cards" ? "bg-surface text-ink shadow-xs" : "bg-transparent text-muted"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8">
                <label className="field w-full">
                  <Search size={14} className="text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by model, lab, or provider..."
                    className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-xs text-muted hover:text-ink cursor-pointer bg-transparent border-none"
                    >
                      Clear
                    </button>
                  )}
                </label>
              </div>

              <div className="sm:col-span-4">
                <label className="field cursor-pointer pr-1 text-xs">
                  <span className="text-muted">Lab:</span>
                  <select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    className="cursor-pointer bg-transparent font-medium outline-none text-ink flex-1"
                  >
                    <option value="all">All Labs ({models.length})</option>
                    {labOptions.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.name} ({opt.count})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Toggle Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-line">
              {TOGGLE_CHIPS.map((chip) => {
                const isActive = activeChips.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleChip(chip.id)}
                    className={`h-8 rounded-[8px] border px-2.5 text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? "border-ink bg-ink text-on-ink"
                        : "border-line bg-surface text-ink hover:bg-sunken"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChips([])}
                  className="text-xs text-muted hover:text-ink ml-1 cursor-pointer bg-transparent border-none"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Active Model Chips */}
            <div className="mt-3 pt-3 border-t border-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted">
                  Active Comparison ({selectedModels.length}/{MAX_SELECTED_MODELS}):
                </span>
                {selectedModels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-[11px] text-muted hover:text-red-500 cursor-pointer bg-transparent border-none"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedModels.map((model) => (
                  <span
                    key={model.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-sunken text-xs text-ink"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: labColors[model.lab] || "#6b6a64" }}
                    />
                    <strong>{model.name}</strong>
                    <span className="text-muted text-[11px]">({model.lab})</span>
                    <button
                      type="button"
                      aria-label={`Remove ${model.name}`}
                      onClick={() => updateSelection(model.id)}
                      className="text-muted hover:text-red-500 ml-1 cursor-pointer bg-transparent border-none"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedModels.length === 0 && (
                  <span className="text-xs text-muted italic py-1">
                    No models selected. Choose from candidates below.
                  </span>
                )}
              </div>
            </div>

            {/* Available candidates */}
            {availableModels.length > 0 && (
              <div className="mt-3 pt-3 border-t border-line">
                <span className="text-xs font-semibold text-muted block mb-2">
                  + Add model to comparison
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      disabled={selectedIds.length >= MAX_SELECTED_MODELS}
                      onClick={() => updateSelection(model.id)}
                      className="text-xs py-1.5 px-3 rounded-lg border border-line bg-surface hover:bg-sunken text-ink disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span className="font-bold mr-1">+</span>
                      <span>{model.name}</span>
                      <span className="text-muted text-[11px] ml-1">· {model.lab}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!hasMinModels && (
            <div className="p-5 rounded-2xl border border-line bg-sunken text-xs text-ink mb-6">
              <strong>Minimum selection required:</strong> Select at least two models to view the technical comparison matrix and cost estimator. You can select up to four models.
            </div>
          )}

          {/* DYNAMIC VIEW ROUTING */}
          {hasMinModels && (
            <div className="space-y-8">
              {/* CARDS MODE */}
              {(activeView === "overview" || viewMode === "cards") && viewMode === "cards" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="serif text-xl font-medium text-ink">Model Cards View</h2>
                    <span className="text-xs text-muted mono">{selectedModels.length} models</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedModels.map((model) => (
                      <div
                        key={model.id}
                        className="p-5 rounded-2xl border border-line bg-surface flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-muted">{model.lab}</span>
                            <span className={`chip ${model.weights === "Open" ? "bg-[var(--tile-olive)]/60 text-[#2d3a12]" : ""}`}>
                              {model.weights}
                            </span>
                          </div>
                          <h3 className="serif text-lg font-medium text-ink mb-1">{model.name}</h3>
                          <p className="text-[11px] text-muted mono mb-4">Released {model.releaseDate}</p>

                          {/* 2x3 Stat grid */}
                          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-sunken border border-line text-xs mb-3">
                            <div>
                              <span className="text-[10px] text-muted block">Context</span>
                              <strong className="text-ink mono">{tokens(model.contextWindow)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted block">Output</span>
                              <strong className="text-ink mono">{tokens(model.maxOutput)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted block">Input / 1M</span>
                              <strong className="text-ink mono">{money(model.inputPricePerMillion)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted block">Output / 1M</span>
                              <strong className="text-ink mono">{money(model.outputPricePerMillion)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted block">Intelligence</span>
                              <strong className="text-ink mono">{model.intelligenceScore.toFixed(1)}/60</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted block">Coding</span>
                              <strong className="text-ink mono">{model.codingScore.toFixed(1)}/60</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                          <span className="text-muted">{model.providers.length} providers</span>
                          <button
                            type="button"
                            onClick={() => updateSelection(model.id)}
                            className="text-xs text-red-500 hover:underline cursor-pointer bg-transparent border-none"
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
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted">OVERVIEW SNAPSHOT</p>
                        <h2 className="serif text-xl font-medium text-ink">Side-by-Side Model Summary</h2>
                      </div>
                      <span className="chip font-mono">
                        {selectedModels.length} models selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedModels.map((model) => {
                        const isLowestIn = model.inputPricePerMillion === lowestInputRate;
                        const isLowestOut = model.outputPricePerMillion === lowestOutputRate;
                        return (
                          <div className="p-5 rounded-2xl border border-line bg-surface" key={model.id}>
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <div className="min-w-0">
                                <h3 className="serif text-base font-medium text-ink truncate">
                                  {model.name}
                                </h3>
                                <span className="text-xs text-muted block">{model.lab}</span>
                              </div>
                              <span className={`chip ${model.weights === "Open" ? "bg-[var(--tile-olive)]/60 text-[#2d3a12]" : ""}`}>
                                {model.weights}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-sunken border border-line text-xs space-y-2 mb-3">
                              <div>
                                <span className="text-[10px] text-muted block">Input rate</span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="serif text-xl font-medium text-ink mono">
                                    {money(model.inputPricePerMillion)}
                                  </span>
                                  <span className="text-xs text-muted">/ 1M</span>
                                  {isLowestIn && <span className="badge-lowest shrink-0">Lowest</span>}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-muted block">Output rate</span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="serif text-base font-medium text-ink mono">
                                    {money(model.outputPricePerMillion)}
                                  </span>
                                  <span className="text-xs text-muted">/ 1M</span>
                                  {isLowestOut && <span className="badge-lowest shrink-0">Lowest</span>}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs space-y-1.5">
                              <div className="flex justify-between text-muted">
                                <span>Context Window:</span>
                                <strong className="text-ink mono">{tokens(model.contextWindow)}</strong>
                              </div>
                              <div className="flex justify-between text-muted">
                                <span>Coding Score:</span>
                                <strong className="text-ink mono">{model.codingScore.toFixed(1)} / 60</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Matrix Widget */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted">SPECIFICATIONS MATRIX</p>
                        <h2 className="serif text-xl font-medium text-ink">Side-by-Side Technical Comparison</h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted md:hidden bg-sunken px-2.5 py-1 rounded border border-line">
                        <MoveHorizontal size={14} className="shrink-0" />
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
                                <strong className="block text-ink text-sm font-semibold">{model.name}</strong>
                                <span className="text-muted block mt-0.5 text-xs">{model.lab}</span>
                                <span className="text-muted block mt-1.5 text-[11px]">
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
                    <div className="mb-2">
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted">USAGE BILL PROJECTION</p>
                      <h2 className="serif text-xl font-medium text-ink">Interactive Cost Calculator</h2>
                    </div>
                    <CostCalculator selectedModels={selectedModels} />
                  </section>
                </>
              )}

              {/* COMPARE ONLY */}
              {activeView === "compare" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted">FULL MATRIX</p>
                      <h2 className="serif text-2xl font-medium text-ink">Technical Comparison Matrix</h2>
                      <p className="text-xs text-muted mt-1">
                        Inspect specifications, benchmarks, modalities, and price highlights side by side.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted md:hidden bg-sunken px-2.5 py-1 rounded border border-line">
                      <MoveHorizontal size={14} className="shrink-0" />
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
                              <strong className="block text-ink text-sm font-semibold">{model.name}</strong>
                              <span className="text-muted block mt-0.5 text-xs">{model.lab}</span>
                              <span className="text-muted block mt-1.5 text-[11px]">
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

              {/* ESTIMATOR ONLY */}
              {activeView === "estimator" && (
                <section className="space-y-4">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted">FINANCIAL ESTIMATION</p>
                    <h2 className="serif text-2xl font-medium text-ink">Monthly API Cost Estimator</h2>
                    <p className="text-xs text-muted mt-1">
                      Adjust token volume controls or pick quick workload presets to simulate monthly spend.
                    </p>
                  </div>
                  <CostCalculator selectedModels={selectedModels} />
                </section>
              )}

              {/* DETAILS ONLY */}
              {activeView === "details" && (
                <section>
                  <ModelDetails selectedModels={selectedModels} />
                </section>
              )}

              {/* ABOUT & METHODOLOGY */}
              {activeView === "about" && (
                <section className="p-6 sm:p-8 rounded-2xl border border-line bg-surface space-y-4 max-w-3xl">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted">ASSESSMENT METHODOLOGY</p>
                  <h2 className="serif text-2xl font-medium text-ink">Make the assumptions visible.</h2>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    The comparison experience uses an illustrative local catalog. Prices, provider listings, release dates, and benchmark scores are demonstration data designed for this Frontend Engineering Assessment.
                  </p>
                  <div className="pt-4 border-t border-line space-y-2 text-xs text-muted">
                    <p>• <strong>Stack</strong>: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.</p>
                    <p>• <strong>Theme</strong>: OneAtlas warm cream/charcoal design system with pastel tiles.</p>
                    <p>• <strong>URL State</strong>: Active selection synchronizes to <code>/compare?models=...</code> via <code>history.replaceState</code>.</p>
                    <p>• <strong>Cost Formula</strong>: <code>(input ÷ 1M × input rate) + (output ÷ 1M × output rate)</code>.</p>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <div className="flex items-center gap-2">
              <BrandLogo />
              <span>· An independent directory of AI models.</span>
            </div>
            <span>Frontend Engineering Assessment · Next.js 16 + React 19 + Tailwind CSS 4</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-ink cursor-pointer bg-transparent border-none text-muted p-0"
            >
              Back to top ↑
            </button>
          </footer>
        </main>
      </div>

      {/* COMMAND PALETTE (⌘K) MODAL */}
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
            <div className="p-3.5 border-b border-line flex items-center gap-2.5">
              <Search size={16} className="text-muted shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models, labs, providers… (Press Esc to close)"
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <span className="kbd">ESC</span>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted px-2 py-1 block">
                Models ({filteredModels.length})
              </span>
              <div className="space-y-1">
                {filteredModels.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => updateSelection(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-sunken border border-line text-ink"
                          : "hover:bg-sunken/60 text-ink-2"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: labColors[m.lab] || "#6b6a64" }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-semibold">{m.name}</strong>
                            <span className="text-[10px] text-muted mono">({m.lab})</span>
                            {isSelected && (
                              <span className="badge-lowest text-[9px] py-0 px-1.5">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted mt-0.5 mono">
                            {money(m.inputPricePerMillion)} in / {money(m.outputPricePerMillion)} out · {tokens(m.contextWindow)} ctx
                          </div>
                        </div>
                      </div>
                      <span className="text-xs mono text-ink">
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

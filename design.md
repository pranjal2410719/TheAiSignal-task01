# Design System Specification — OneAtlas Dark Theme
**Extracted & Adapted from [oneatlas.dev](https://oneatlas.dev)**

---

## 1. Executive Summary & Vision

**OneAtlas** is a precision engineering catalog and comparison workspace for AI models. It balances high-density technical information with immaculate typography, subtle micro-interactions, and instant feedback.

This specification adapts the visual identity of **oneatlas.dev** into the required **OneAtlas Dark Theme**:
- **Canvas & Surfaces**: Deep charcoal and rich slate tones (`#090d12`, `#0f151e`, `#141c28`).
- **Accents**: Radiant emerald green (`#34d399` / `#10b981`) paired with soft emerald tints (`rgba(16, 185, 129, 0.12)`).
- **Typography**: Clean humanist sans paired with tabular monospace numerals for prices, limits, and benchmarks.
- **Layout**: High-performance dashboard with persistent sidebar navigation, top KPI analytical widgets, pinned specification matrix, and synchronized cost estimator.

---

## 2. Color Palette & Design Tokens

### Core Theme Tokens (Adapted for Dark Mode)

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--canvas` | `#080c11` | Application background (root viewport) |
| `--surface` | `#0f151f` | Primary cards, panels, and table bodies |
| `--surface-elevated` | `#151d2a` | Hover states, modals, and pinned sticky columns |
| `--sunken` | `#0a0e14` | Recessed input fields, code chips, and meter tracks |
| `--hover` | `#1a2433` | Interactive hover states for rows, buttons, and chips |
| `--line` | `#202c3b` | Structural borders, card outlines, and dividers |
| `--hairline` | `#16202c` | Subtle intra-table separators and sub-dividers |
| `--ink` | `#f1f5f9` | Primary text, titles, and high-emphasis numerals |
| `--ink-2` | `#cbd5e1` | Secondary headings, model names, and active labels |
| `--muted` | `#8292a2` | Subtitles, field labels, and secondary indicators |
| `--faint` | `#4b5b6d` | Placeholder text, disabled controls, and inactive dots |
| `--accent` | `#34d399` | Primary emerald brand accent (buttons, active pills, lowest price) |
| `--accent-soft` | `rgba(16, 185, 129, 0.12)` | Tinted chip backgrounds, active tabs, and callouts |
| `--accent-line` | `rgba(52, 211, 153, 0.28)` | Accent borders and focus ring outlines |
| `--accent-glow` | `rgba(16, 185, 129, 0.22)` | Subtle ambient backdrops and shadow highlights |
| `--pos` | `#34d399` | Positive indicators (Open weights, Best value, Lowest bill) |
| `--pos-soft` | `rgba(52, 211, 153, 0.12)` | Positive badge pill backgrounds |

---

## 3. Typography Hierarchy

OneAtlas emphasizes strict typography distinction between **labels**, **values**, and **data tables**:

1. **Brand & Displays**:
   - `Display Serif / Modern`: `font-semibold`, tracking `-0.035em`, text-balance.
   - `Hero Headline`: Fluid `clamp(30px, 4.5vw, 54px)`, line-height `1.08`.
2. **Body & Interface**:
   - `Body`: System UI / Geist Sans (`14px / 1.5`, `-webkit-font-smoothing: antialiased`).
   - `Eyebrow / Kicker`: Monospace, `10.5px`, uppercase, tracking `0.12em`, emerald accent.
3. **Tabular Numerals (Data & Prices)**:
   - `font-mono` (`font-variant-numeric: tabular-nums`, letter-spacing `-0.015em`).
   - Ensures monetary values (`$0.33`, `$1.32`) and token quantities (`1,000,000`) align perfectly in columns without jitter.

---

## 4. UI Components & Architectural Breakdown

### 4.1 Header & Topbar (`.topbar`)
- **Height**: 60px (h-14 / h-15) sticky bar with `backdrop-filter: blur(14px)`.
- **Brand Mark**:
  - Rounded SVG icon (`rx="7"`), dark background, fine circular globe vectors, and emerald node dot.
  - Typography: `OneAtlas` (`0.98rem`, font-semibold, letter-spacing `-0.03em`).
- **Global Search Button**:
  - Replaces bulky form with command-style trigger `⌘K`.
  - Placeholder: `"Search models, labs, providers..."`.
- **Action Buttons**:
  - Share URL button with clipboard copy confirmation (`Link Copied!`).

### 4.2 Sidebar Navigation (`.dashboard-sidebar`)
- **Desktop (1024px+)**: Pinned 260px left sidebar with glass charcoal background.
- **Mobile (< 1024px)**: Sliding drawer overlay triggered by hamburger icon.
- **Sections**:
  1. *Brand Header* with close toggle for mobile.
  2. *View Navigation*: Overview, Compare Matrix, Cost Estimator, Model Details, About.
  3. *Active Selection Drawer*: Shows selected model count (`X/4`), removable chips with `×`, and quick-add candidate pills.
  4. *Footer*: OneAtlas Dark theme status pill.

### 4.3 KPI Metric Cards (`.dashboard-kpi-grid`)
Four compact analytical cards rendered above the workspace:
1. **Active Set**: Count (`X/4`) and validation state badge (`Valid Set` or `Need >= 2`).
2. **Lowest Input Rate**: Real-time cheapest input rate per 1M tokens with model & lab identity.
3. **Lowest Output Rate**: Real-time cheapest output rate per 1M tokens with model & lab identity.
4. **Best Estimated Bill**: Projected monthly bill at standard volume + potential savings callout against the next-cheapest model.

### 4.4 Model Selector & Chips Bar
- Command-style text search filtering across model name, AI lab, providers, and IDs.
- Color-coded removable chips with active indicator dot and accessible remove button (`×`).
- Available candidate buttons (`+ Model · Lab`) with disabled state when `selectedCount >= 4`.
- Empty state notice displayed when `selectedCount < 2`.

### 4.5 Pinned Comparison Matrix (`.sheet` / `.index-frame`)
- **Sticky First Column (`.spec-header-col` / `[data-pin]`)**:
  - Specification labels pinned to the left (`position: sticky; left: 0; z-index: 5`) with box-shadow separation.
  - Allows seamless horizontal scrolling on phones and tablets without losing context.
- **Lowest Rate Highlighting**:
  - Lowest input price and output price per row highlighted with emerald badge (`badge-emerald`).
- **Score Meter Bars (`.benchmark-bar` / `.score-track`)**:
  - Scaled out of 60 points with colored progress indicators (Emerald for Intelligence, Sky for Coding, Purple for Agentic).
- **Modality & Provider Pills**:
  - High-density rounded tags with subtle borders and neutral fills.

### 4.6 Interactive Cost Estimator (`.cost-grid`)
- **Best Value Hero Banner**: Spotlights the lowest-cost model and calculates exact dollar savings per month.
- **Quick Workload Presets**: One-click toggles for common workloads (*Light: 1M/200K*, *Standard: 5M/1M*, *Heavy: 20M/4M*, *Enterprise: 50M/10M*).
- **Synchronized Controls**: Range sliders and numeric inputs sharing unified state bounded between `0` and `100,000,000` tokens.
- **Cost Line Items**: Ranked list with `#1 Lowest Bill` badge and relative cost difference indicators (`+$X.XX more than lowest`).

---

## 5. Micro-Interactions & Animation Tokens

- **Hover Transitions**: `transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1)`.
- **Card Lift**: Cards subtly elevate (`transform: translateY(-2px)`) on hover with border illumination.
- **Accessible Motion**: Honors `prefers-reduced-motion: reduce` by zeroing transition durations.
- **Focus Rings**: `outline: 2px solid var(--accent); outline-offset: 2px` for complete keyboard accessibility.

---

## 6. URL Synchronization Specification

- **Primary Route**: `/compare?models=id1,id2`.
- **Navigation Update**: Managed using `window.history.replaceState` without full-page reloads.
- **Browser History**: Handled via `popstate` event listener to restore state on Back/Forward actions.
- **Validation Rules**:
  - Missing parameter: loads default models.
  - Empty parameter (`?models=`): remains empty.
  - Unknown or malformed IDs: filtered out automatically.
  - Duplicates: deduplicated preserving order of appearance.
  - Maximum size: capped at 4 models.

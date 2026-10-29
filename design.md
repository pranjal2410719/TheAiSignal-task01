# OneAtlas — DESIGN.md

> Design spec to recreate the oneatlas.dev frontend, adapted to the **OneAtlas Dark** theme (slate/charcoal surfaces, emerald accents).

**Source note.** Structure, IA, copy, component inventory and data columns come from the live page. The live site ships a light scheme (`color-scheme: light`, `theme-color: #faf9f5`, a warm off-white). Exact CSS values (fonts, px sizes) were not exposed in the fetched HTML, so the tokens below are a **proposed dark system** built to match the site's dense, data-first, minimal character. Tune values against DevTools if you want pixel parity.

---

## 1. Product & Design Principles

- **What it is:** a comparison database of AI models (1,123 models, 78 labs, 220 providers, 8,289 API listings).
- **Personality:** quiet, utilitarian, dense. Data is the hero; chrome stays out of the way.
- **Principles**
  1. Tables first: scan, sort, filter in seconds.
  2. One accent (emerald) used sparingly for state, not decoration.
  3. Hierarchy via surface elevation + text contrast, not heavy borders or shadows.
  4. Tabular numerals everywhere numbers are compared.
  5. Keyboard-first (`⌘K` search, visible focus rings).

---

## 2. Information Architecture

**Top nav:** Models (`/`), Compare (`/compare`), Rankings (`/rankings`), Benchmarks (`/benchmarks`), Labs (`/labs`), Providers (`/providers`) + global search (`⌘K`: "Search models, labs, providers").

**Home (`/`) sections, in order**
1. Skip-to-content link (`#main`)
2. Header (logo, nav, search)
3. Hero: "Updated Oct 27, 2026" chip, H1 *Every AI model, compared.*, subcopy, 3 CTAs (Compare models = primary, See rankings, Benchmarks = secondary)
4. Stat strip: Models 1,123 · Labs 78 · Providers 220 · API listings 8,289
5. Two insight cards: **Releases per month** (bar/area chart, "608 in 12 mo", axis Nov 25 → Oct 26) and **Capability coverage** (4 horizontal progress rows: Tool calling 66%, Reasoning 50%, Vision input 49%, Open weights 44%)
6. Filter bar: search input, **Lab** select (with counts), **Provider** select, **Type** select (Text/Image/Video/Embedding/Speech/Transcription/Reranking/Realtime with counts)
7. Result count ("1,123 models") + **Table / Cards** view toggle
8. Toggle chips: Reasoning, Tool calling, Structured output, Vision, Open weights, 1M+ context, Free, Hide deprecated
9. Data table (sortable columns) / Cards view + Side-by-side Compare & Cost Estimator workspace
10. Footer: wordmark, tagline "Every AI model, side by side.", nav repeat, updated date

---

## 3. Color Tokens (OneAtlas Dark)

Slate/charcoal ramp with cool undertone; emerald as the only chromatic accent.

```css
:root {
  color-scheme: dark;

  /* Surfaces */
  --bg:            #0b0f12;  /* page background (deep charcoal) */
  --bg-subtle:     #0f1418;  /* header, footer bands */
  --surface-1:     #141a1f;  /* cards, table body */
  --surface-2:     #1a2127;  /* table header, inputs, hovered rows */
  --surface-3:     #222b32;  /* popovers, menus, selected */
  --overlay:       rgba(5, 8, 10, 0.72);

  /* Borders */
  --border:        #232c33;  /* default hairline */
  --border-strong: #2f3a42;  /* inputs, focused containers */

  /* Text */
  --text:          #e8edf0;  /* primary */
  --text-muted:    #9aa7b0;  /* secondary */
  --text-faint:    #66737c;  /* placeholders, em-dash "—" cells */
  --text-on-accent:#04140d;

  /* Emerald accent */
  --accent-300:    #6ee7b7;  /* highlights, chart strokes on dark */
  --accent-400:    #34d399;  /* links, active nav, focus ring */
  --accent-500:    #10b981;  /* primary buttons, progress fill */
  --accent-600:    #059669;  /* primary hover/pressed */
  --accent-soft:   rgba(16, 185, 129, 0.12);  /* chip bg, selected row tint */
  --accent-ring:   rgba(52, 211, 153, 0.45);

  /* Semantic */
  --success: #34d399;
  --warning: #fbbf24;   /* "?" unknown flags, deprecated */
  --danger:  #f87171;
  --info:    #7dd3fc;
  --new-badge-bg: var(--accent-soft);
  --new-badge-fg: var(--accent-300);
}
```

**Usage rules**
- Page bg `--bg`; every raised block `--surface-1`; interactive controls `--surface-2`.
- Emerald only for: primary CTA, active nav/tab, selected chips, focus ring, progress/chart fills, "New" badge, "Open" weights tag.
- Never put emerald text on emerald-soft below 4.5:1; use `--accent-300` on `--accent-soft`.

**Contrast checks (target AA):** `--text` on `--surface-1` ≈ 14:1; `--text-muted` on `--surface-1` ≈ 6.5:1; `--text-on-accent` on `--accent-500` ≈ 7:1.

---

## 4. Typography

- **Sans (UI/body):** `Inter`, fallback `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- **Mono (IDs, slugs, prices):** `"JetBrains Mono"`, fallback `ui-monospace, SFMono-Regular, Menlo, monospace`
- Enable `font-variant-numeric: tabular-nums` on all table cells and stats.

| Role | Size / Line | Weight | Notes |
|---|---|---|---|
| H1 (hero) | 48 / 52 (36/40 mobile) | 650 | letter-spacing −0.02em |
| H2 (section/card title) | 20 / 28 | 600 | |
| Stat number | 28 / 32 | 600 | tabular |
| Body | 15 / 24 | 400 | |
| Table cell | 13 / 20 | 400 | |
| Table header | 12 / 16 | 500 | uppercase optional, letter-spacing 0.04em, `--text-muted` |
| Caption / meta | 12 / 16 | 400 | `--text-faint` |
| Mono slug | 12 / 16 | 400 | `lab·slug` under model name |

---

## 5. Spacing, Radius, Elevation, Motion

- **Spacing scale (px):** 2, 4, 8, 12, 16, 20, 24, 32, 48, 64
- **Container:** `max-width: 1280px`, side padding 24 (16 mobile)
- **Radius:** `sm 6` (chips, inputs) · `md 10` (buttons, cards) · `lg 14` (stat/insight cards) · `full` (badges, avatars)
- **Elevation:** avoid shadows; separate with borders. Popovers only: `0 8px 24px rgba(0,0,0,.45)`
- **Motion:** 120–160ms ease-out for hover/focus; chart bars animate 400ms on mount; respect `prefers-reduced-motion`

---

## 6. Components

### 6.1 Header
- Height 56, sticky, `--bg-subtle` at 85% + `backdrop-filter: blur(8px)`, bottom border `--border`.
- Left: logo mark + "OneAtlas" (600). Center/left nav links 14px `--text-muted`; hover `--text`; active `--accent-400` with 2px bottom indicator.
- Right: search trigger (button styled as input) with `⌘K` kbd badge. Mobile: nav collapses to a menu button; search becomes icon.

### 6.2 Hero
- Left-aligned, max-width 720. "Updated Oct 27, 2026" pill: `--surface-2`, border, 12px text, small emerald dot.
- CTAs: **Primary** `See rankings` (bg `--accent-500`, text `--text-on-accent`, hover `--accent-600`); **Secondary** `Benchmarks`, `Browse labs` (bg `--surface-2`, border `--border-strong`, hover `--surface-3`). Height 40, radius 10, padding 0 16.
- Optional subtle radial glow: `radial-gradient(600px 240px at 20% 0%, rgba(16,185,129,.10), transparent)`.

### 6.3 Stat strip
- 4-up grid (2-up mobile). Each: label (caption, muted) above number (28px). No box, separated by 1px vertical borders, or wrap in a single `--surface-1` card.

### 6.4 Insight cards (2-column, stack on mobile)
- Card: `--surface-1`, 1px `--border`, radius 14, padding 20.
- **Releases per month:** title + "608 in 12 mo" (muted, right-aligned). 12 vertical bars (Nov 25 → Oct 26), fill `--accent-500` at 70% opacity, current month `--accent-300`. Baseline `--border`. X labels only first/last (12px faint). Tooltip on hover: month + count.
- **Capability coverage:** 4 rows: label left, % right (tabular), 6px track `--surface-3`, fill `--accent-500`, radius full.

### 6.5 Filter bar
- Row of controls, wraps on mobile. Height 40, bg `--surface-2`, border `--border-strong`, radius 10.
- Search input with leading icon; focus: border `--accent-400` + 3px `--accent-ring`.
- Selects show option counts, e.g. `Anthropic (38)`. Use a searchable combobox (Lab and Provider lists are long).
- **Toggle chips** (Reasoning, Tool calling, …): default `--surface-2` + border; selected `--accent-soft` bg, `--accent-300` text, border `rgba(52,211,153,.35)`, with check icon.
- Result count `1,123 models` (14px, muted) left; **Table | Cards** segmented control right.

### 6.6 Data table (core component)
Columns: **Model · Providers · Context · Output · Modalities · Reasoning · Tools · JSON · Temp · Weights · Price / 1M · Cache · Intelligence · Released · Updated**

- Wrapper: `--surface-1`, border, radius 14, `overflow-x: auto`; **sticky header** and **sticky first column** (Model).
- Header row: `--surface-2`, 12px muted, sortable with ▲▼ indicator, active sort `--text` + emerald arrow. Click to cycle asc/desc/none.
- Row: height 56, border-bottom `--border`, hover `--surface-2`, focus-within ring.
- **Model cell:** 24px lab logo (or 2-letter monogram on `--surface-3` when no logo, e.g. "RE", "UN", "LI", "OP"), model name as link (`--text`, 500), `New` badge (emerald-soft, 11px), below it `Lab · slug` in mono 12px faint.
- **Providers cell:** overlapping 20px circular provider logos (max 3, −6px overlap, 2px `--surface-1` ring) + count (e.g. "16"), links to `#providers` on the model page.
- **Context / Output:** compact units (`1.05M`, `128K`), right-aligned, tabular.
- **Modalities:** small icon set (text/image/audio/video) 14px muted.
- **Reasoning / Tools / JSON / Temp:** boolean glyphs. ✓ `--accent-400`, ✕ `--text-faint`, `?` unknown `--warning`.
- **Weights:** pill. `Open` = emerald-soft/emerald-300; `Closed` = `--surface-3`/muted.
- **Price / 1M:** `$in / $out` in mono, e.g. `$1.00 / $5.00`; `Free` as emerald text; missing → `—`.
- **Cache:** `$0.05` or `—`.
- **Intelligence:** numeric score (e.g. `48.1`) + optional 40px mini bar; `—` when unknown.
- **Released / Updated:** `Oct 26, 2026` muted.
- Empty state: centered icon, "No models match", ghost button "Clear filters".
- Pagination or windowed infinite scroll (1,123 rows → virtualize).

### 6.7 Cards view
- Responsive grid (1 / 2 / 3 cols). Card: `--surface-1`, border, radius 14, padding 16; header = logo + name + New badge; key stats as 2×3 grid (Context, Output, Price, Intelligence, Weights, Providers); footer chips for capabilities.

### 6.8 Footer
- `--bg-subtle`, top border, wordmark + tagline left, nav links right, "Updated Oct 27, 2026" caption.

### 6.9 Command palette (⌘K)
- Centered modal 640 wide, `--surface-2`, border `--border-strong`, radius 14, overlay `--overlay`. Grouped results: Models, Labs, Providers. Active item `--accent-soft` with left 2px emerald bar.

---

## 7. States & Accessibility

- **Focus:** `outline: 2px solid var(--accent-400); outline-offset: 2px` on all interactive elements.
- **Hit targets:** ≥ 40px (buttons, chips on touch).
- Skip link `#main` visible on focus.
- Table semantic markup (`<table>`, `scope="col"`, `aria-sort`); boolean icons need `aria-label` ("Supports tool calling").
- Don't rely on color alone: pair ✓/✕ glyphs and text labels.
- Charts: provide a visually hidden data table or `aria-label` summary.
- Honor `prefers-reduced-motion` and `prefers-color-scheme` (default to this dark theme; keep light tokens as optional variant with `#faf9f5` bg).

---

## 8. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| ≥1280 | full table, 2-col insight cards |
| 1024–1279 | table scrolls horizontally, Model column sticky |
| 640–1023 | insight cards stack, filters wrap into 2 rows, default to Cards view |
| <640 | nav → menu, stat strip 2×2, filters in a bottom sheet, Cards view only |

---

## 9. Tailwind Config (drop-in)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b0f12',
        subtle: '#0f1418',
        surface: { 1: '#141a1f', 2: '#1a2127', 3: '#222b32' },
        line: { DEFAULT: '#232c33', strong: '#2f3a42' },
        ink: { DEFAULT: '#e8edf0', muted: '#9aa7b0', faint: '#66737c' },
        emerald: { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { md: '10px', lg: '14px' },
      maxWidth: { page: '1280px' },
    },
  },
};
```

---

## 10. Suggested Build Stack & Structure

- **Stack:** Next.js (App Router) + Tailwind + TanStack Table (sorting, filtering, virtualization via TanStack Virtual) + Plain SVG for the monthly-releases chart + `cmdk` / custom modal for ⌘K.
- **Routes:** `/`, `/compare`, `/rankings`, `/benchmarks`, `/labs`, `/providers`.
- **Component tree:**

```
<AppShell>
  <Header/>            // Nav, SearchTrigger
  <main id="main">
    <Hero/>
    <StatStrip/>
    <InsightGrid>
      <ReleasesChart/>
      <CapabilityCoverage/>
    </InsightGrid>
    <ModelExplorer>
      <FilterBar/>     // Search, LabSelect, ProviderSelect, TypeSelect
      <ToggleChips/>
      <ViewToggle/>
      <ModelTable/> | <ModelCards/>
      <CompareWorkspace/> // Side-by-side spec matrix & Cost Estimator
    </ModelExplorer>
  </main>
  <Footer/>
  <CommandPalette/>
</AppShell>
```

---

## 11. Do / Don't

- ✅ Use emerald for state and data highlights; keep large areas neutral slate.
- ✅ Right-align and tabularize all numeric columns.
- ✅ Show `—` for missing data, never `0` or blank.
- ❌ No gradients on surfaces (only the faint hero glow), no heavy shadows, no second accent color.
- ❌ Don't use pure `#000` or pure `#fff`; stay inside the token ramp.

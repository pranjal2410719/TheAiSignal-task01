# The AI Signal — Model Comparison & Cost Estimator

The application is built using **Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4**. It features an introductory full-screen presentation on `/` and a direct, dedicated comparison workspace on `/compare`.

## Requirements and local setup

Use Node.js 20.19 or newer in the 20.x series, or Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the introductory hero, or directly navigate to http://localhost:3000/compare to enter the comparison workspace with shared URL parameters.

## Build and checks

```bash
npm test
npm run build
npm run lint
```

- **Unit tests**: Vitest suite covering URL model selection parsing and monthly cost calculations.
- **Production build**: Next.js 16 Turbopack production build with strict TypeScript validation.
- **Linter**: ESLint 9 with Next.js rules (`0 errors, 0 warnings`).

## Architecture & Navigation Flow

1. **Introductory Screen (`/`)**:
   - Displays a full-screen introduction ([`hero-screen.tsx`](components/hero-screen.tsx)) with value proposition, catalog statistics, and a primary **Launch workspace →** CTA.
   - Clicking the CTA or navigation buttons unmounts the hero screen completely and renders the persistent application workspace in the same screen without page reloads.

2. **Persistent Application Workspace (`/compare`)**:
   - Accessing `/compare` directly (e.g. grading scripts or shared links) immediately opens the workspace, bypassing the hero to ensure review compliance.
   - A persistent topbar provides view switching (`Compare`, `Cost Estimator`, `Model Details`, `All-in-One`), the brand logo, and a share button.
   - Switching views re-renders the active component within the same screen while 100% preserving selected models, token counts, and URL query state.

3. **Comparison Behavior & Specifications**:
   - **Model Selector**: Search by model name, AI lab, hosting provider, or ID. Select 2–4 models with color-coded removable chips. When fewer than 2 models are selected, a helpful guidance notice is displayed.
   - **Side-by-Side Matrix**: Full specifications table (context window, max output, modalities, rates, benchmarks, providers, release date). Lowest input rate and output rate are highlighted with emerald badges. The first column is pinned (`position: sticky; left: 0`) for mobile scrolling.
   - **Interactive Cost Estimator**: Defaults to 5,000,000 input and 1,000,000 output tokens. Synchronized sliders and numeric inputs bounded between 0 and 100,000,000 tokens. Features quick workload presets (*Light, Standard, Heavy, Enterprise*), the cheapest model highlight, and exact monthly savings calculated against the next-cheapest model.
   - **Model Details**: Deep-dive capability view showing visual benchmark meters (Intelligence, Coding, Agentic out of 60) and deployment profiles.

4. **URL Synchronization & State**:
   - Active models are synchronized to the `?models=...` query parameter via `window.history.replaceState` without reloading.
   - A `popstate` listener restores selection during browser back/forward navigation.
   - Malformed IDs, unknown models, and duplicates are filtered safely; an empty query remains empty.
   - The Share button copies the `/compare?models=...` URL with instant visual feedback.

5. **Responsive Design Strategy**:
   - Fluid typography using CSS `clamp()`.
   - Grid layouts that scale dynamically across mobile (1-col), tablet (2-col), and desktop (4-col).
   - Horizontal touch scrolling on comparison tables with sticky specification headers and swipe indicators.
   - Self-contained responsiveness inside every component.

## Data limitations

All model records, sample prices, provider lists, release dates, and benchmark scores are illustrative assessment demonstration data, not a verified live feed. Cost estimates exclude caching discounts, tiered API pricing, taxes, and provider-specific fees. Verify current details directly with providers before production use.

## Deployment

Deployable to Vercel, Netlify, or Cloudflare Pages with default Next.js build settings.

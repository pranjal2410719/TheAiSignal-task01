# OneAtlas Model Comparison

This repository contains the original The AI Signal landing page and the model-comparison experience at `/compare`.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite and visit `/compare`.

## Comparison behavior

- The comparison page uses React state and a local demonstration catalog in `src/Compare.jsx`.
- Select up to four models. The selector searches model names, labs, and providers; selected models can be removed.
- The `models` query parameter is read on page load. Unknown IDs are ignored, duplicate IDs are removed, and an explicitly empty or invalid selection stays empty instead of silently reverting to defaults.
- Changes are reflected in the URL using a short debounce and `history.replaceState`, without a page reload. Browser `popstate` events resynchronize the selected models.
- The comparison matrix preserves readable columns with horizontal scrolling on small screens.
- The estimator uses the formula `(input tokens / 1,000,000 × input price) + (output tokens / 1,000,000 × output price)`. Number inputs are bounded to the same ranges as their sliders.
- The CI workflow in `.github/workflows/frontend-ci.yml` installs dependencies and runs the production build on pull requests targeting `main`.

## Data and limitations

The catalog, provider lists, release dates, prices, and benchmark scores are local demonstration data, not a live model/provider feed. Do not use them for purchasing decisions without independent verification. The cost estimate excludes caching discounts, taxes, and provider-specific fees.

## Current implementation stack

The current app is Vite + React 18 + JavaScript + standalone CSS. The assessment brief names Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS. This implementation has **not** been migrated to that required stack yet, so it should not be described as fully compliant with the assessment's stack/TypeScript criteria.

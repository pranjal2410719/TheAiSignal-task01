# OneAtlas Model Comparison

This repository includes the original The AI Signal landing page and a separate model comparison experience at `/compare`.

## Run locally

1. Install Node.js (18 or newer recommended).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite, then visit `/compare`.

## Comparison behavior

- The comparison is implemented as a React page using local mock model data in `src/Compare.jsx`.
- The selected model IDs are synchronized to the `models` query parameter using `history.replaceState`, so comparison URLs can be copied and reopened.
- Users can compare two to four models, search the available sample models, and remove selected models.
- The monthly cost estimator calculates prompt and completion charges from per-million-token rates.
- `src/compare.css` contains the OneAtlas-style visual system and responsive breakpoints. On smaller screens, the comparison matrix scrolls horizontally to preserve readable column widths, while the surrounding controls stack vertically.
- The model catalog and prices are demo data, not a live provider feed. Estimates do not include caching discounts, taxes, or provider-specific fees.

## Deployment notes

This is a Vite + React application. The Vercel rewrite sends application routes to the SPA entry point so direct visits to `/compare` work. The original landing page remains available at `/`.

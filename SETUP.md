# The AI Signal — Model Comparison

The project uses **Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4**. The landing page is available at `/`; model comparison is at `/compare`.

## Requirements and local setup

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and visit `/compare`.

## Build and checks

```bash
npm test
npm run build
npm run lint
```

The unit tests cover URL selection parsing and monthly cost calculations. The Next.js production build includes TypeScript validation. CI runs unit tests, the production build, and lint for pull requests and pushes.

## Comparison behavior

- Select and remove up to four models; the comparison matrix and cost calculator appear only with at least two selected models.
- Search includes model name, lab, provider, and model ID.
- The `models` query parameter is parsed on load. Unknown IDs are ignored, duplicates are removed, and a present-but-empty parameter remains empty.
- Selection updates the URL with `history.replaceState` without reloading; `popstate` restores selection when browser navigation changes the URL.
- The matrix scrolls horizontally on narrow screens.
- Defaults: 5,000,000 input tokens and 1,000,000 output tokens. Slider and number inputs share state and bounds (0–100,000,000 tokens).
- Formula: `(input tokens / 1,000,000 × input price per million) + (output tokens / 1,000,000 × output price per million)`.
- The lowest estimated bill is marked and the difference to the next-cheapest selected model is shown.

## Data limitations

Model records, prices, provider lists, release dates, and benchmark scores are illustrative assessment data, not verified current facts or a live provider feed. Cost estimates exclude caching discounts, taxes, and provider-specific fees. Verify current details with providers before relying on them.

## Deployment

Connect the repository to Vercel and use the default Next.js build settings. The current deployment must be rebuilt from the updated branch before its behavior can be considered verified.

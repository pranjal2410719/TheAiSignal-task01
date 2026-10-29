# AI Playground environment setup

The model comparison catalog remains illustrative. The Playground uses real model IDs supported by OpenRouter; provider availability and pricing may change.

## Required environment variables

Set these in local `.env.local` and in Vercel Project Settings → Environment Variables:

- `OPENROUTER_API_KEY`: server-only OpenRouter API key. Never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_URL`: Supabase project URL, for example `https://YOUR_PROJECT.supabase.co`.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key. Never expose it to the browser or commit it.

Optional:
- `NEXT_PUBLIC_APP_URL`: application URL used as the OpenRouter HTTP Referer.

## Database setup

Open the Supabase SQL Editor and run `supabase/usage_history.sql`. The API uses Supabase's REST endpoint from server-side route handlers; no database key is sent to the browser.

## Routes

- `/playground`: live model prompts and responses
- `/api/chat`: validates the request and calls OpenRouter from the server
- `/history`: recent saved requests for the current browser session
- `/api/history`: server-side usage-history query

## Important limitations

- The demo keeps a random browser-session UUID in localStorage; history is grouped by that ID, not by a verified user account. It is suitable for a classroom demo, not multi-user production privacy.
- A successful AI response is still returned if history storage is unavailable. The Playground shows whether history was saved.
- The chat request is not streamed yet; it shows a loading state and renders the complete response when the provider returns.
- OpenRouter free model availability, quotas, rate limits, and provider behavior can change. Configure billing/limits on your provider account as appropriate.

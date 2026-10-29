# AI Playground setup

The model comparison catalog uses illustrative data. The Playground sends requests to OpenRouter using real provider model IDs; availability and free-tier limits can change.

## AI provider

Create an OpenRouter API key and set this server-only variable in local `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

Never prefix this key with `NEXT_PUBLIC_` and never commit it to GitHub. Set it in Vercel Project Settings only if you want live AI responses on the deployed site.

Optional:
- `NEXT_PUBLIC_APP_URL`: app URL sent as the OpenRouter HTTP Referer.

## SQLite usage history

Local development uses Node's built-in `node:sqlite` module. Use Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

The database is created automatically at `data/usage-history.sqlite` on the first chat request. To choose another local path, set `SQLITE_DB_PATH` to a writable filesystem path. The SQLite database file is ignored by Git.

No Supabase project or manual SQL setup is needed.

## Routes

- `/playground`: prompt interface and model selection
- `/api/chat`: server-side request validation and OpenRouter call; saves successful prompts to SQLite when local storage is available
- `/history`: recent requests for the current browser session
- `/api/history`: reads the session's recent SQLite history

## Deployment limitation

A SQLite file on a developer's machine is persistent locally, but a regular Vercel serverless function does not provide a durable, shared writable filesystem. Therefore, the SQLite history API reports that local SQLite is unavailable on Vercel rather than claiming that records are safely stored. The AI response can still be returned if history storage is unavailable. For durable deployed history, use a persistent host volume or a hosted SQLite-compatible service such as Turso/libSQL.

The demo uses a random browser-generated session UUID, not a verified user account. It is suitable for a classroom prototype, not production multi-user authorization. Chat responses currently render after the full provider response; token streaming is not implemented.

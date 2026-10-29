-- Run this in the Supabase SQL Editor before enabling persistent history.
create table if not exists public.usage_history (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  model text not null,
  prompt text not null,
  response text not null,
  tokens_used integer,
  created_at timestamptz not null default now()
);

create index if not exists usage_history_session_created_idx
  on public.usage_history (session_id, created_at desc);

alter table public.usage_history enable row level security;

-- Access is performed only from server routes with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose the service-role key as a NEXT_PUBLIC_* variable.

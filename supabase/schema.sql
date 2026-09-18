-- THROWBACK database
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_token text not null,
  status text not null default 'lobby' check (status in ('lobby','question','finished')),
  current_round integer not null default 0 check (current_round between 0 and 9),
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,
  player_token text unique not null,
  total_score integer not null default 0,
  joined_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round integer not null check (round between 0 and 9),
  guessed_year integer not null check (guessed_year between 1800 and 2026),
  correct_year integer not null check (correct_year between 1800 and 2026),
  points integer not null check (points between 0 and 100),
  submitted_at timestamptz not null default now(),
  unique(player_id, round)
);

create index if not exists players_game_idx on public.players(game_id);
create index if not exists answers_game_round_idx on public.answers(game_id, round);

-- The website uses the server-side Supabase service-role key for all reads/writes.
-- Therefore browser access to these tables is not needed.
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- No anon/authenticated policies are intentionally created.
-- Keep SUPABASE_SECRET_KEY server-only in Vercel.

-- Initial schema for the personal gamification app.
-- Every table (except user_settings, keyed by user_id) has a `user_id` column
-- that defaults to auth.uid(), so inserts from the app don't need to pass it.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.pillar as enum ('academico', 'deportivo', 'profesional', 'personal');
create type public.jiujitsu_type as enum ('gi', 'no_gi', 'open_mat');
create type public.match_result as enum ('win', 'loss', 'draw');
create type public.match_method as enum ('submission', 'points', 'decision', 'dq', 'other');
create type public.project_status as enum ('active', 'paused', 'finished');
create type public.book_status as enum ('reading', 'finished', 'abandoned');
create type public.streak_type as enum ('meditation', 'journaling', 'reading', 'global');

-- ── User settings ───────────────────────────────────────────────────────

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  day_cutoff_hour int not null default 4 check (day_cutoff_hour between 0 and 23),
  created_at timestamptz not null default now()
);

-- Automatically create a settings row (with defaults) whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Academico ────────────────────────────────────────────────────────────

create table public.quarters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  quarter_id uuid not null references public.quarters (id) on delete cascade,
  name text not null,
  color text not null,
  weekly_exercise_goal int not null default 10 check (weekly_exercise_goal > 0),
  created_at timestamptz not null default now()
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  name text not null,
  total_exercises int not null check (total_exercises > 0),
  completed_exercises int not null default 0 check (completed_exercises >= 0),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.exercise_progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  guide_id uuid not null references public.guides (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  exercises_added int not null check (exercises_added > 0),
  game_date date not null,
  created_at timestamptz not null default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  guide_id uuid references public.guides (id) on delete set null,
  duration_minutes int not null check (duration_minutes > 0),
  topic text,
  notes text,
  date date not null,
  created_at timestamptz not null default now()
);

-- ── Deportivo ────────────────────────────────────────────────────────────

create table public.jiujitsu_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  type public.jiujitsu_type not null,
  duration_minutes int not null check (duration_minutes > 0),
  sparring_rounds int not null default 0 check (sparring_rounds >= 0),
  submissions_achieved int not null default 0 check (submissions_achieved >= 0),
  submissions_received int not null default 0 check (submissions_received >= 0),
  new_techniques text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_name text not null,
  category text,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.competition_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  match_order int not null default 1,
  result public.match_result not null,
  method public.match_method not null,
  score text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.cross_training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  discipline text not null,
  date date not null,
  duration_minutes int not null check (duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- ── Profesional ──────────────────────────────────────────────────────────

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  status public.project_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.project_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  date date not null,
  notes text not null,
  hours numeric(5, 2) check (hours is null or hours >= 0),
  created_at timestamptz not null default now()
);

-- ── Personal ─────────────────────────────────────────────────────────────

create table public.meditation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  duration_minutes int check (duration_minutes is null or duration_minutes > 0),
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  author text,
  status public.book_status not null default 'reading',
  created_at timestamptz not null default now()
);

create table public.reading_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  book_id uuid references public.books (id) on delete set null,
  game_date date not null,
  pages_read int not null check (pages_read > 0),
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.creative_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  activity text not null,
  date date not null,
  duration_minutes int not null check (duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- ── To-do list (organizational only, no XP) ────────────────────────────

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null,
  for_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Game engine: XP, streaks, coins, missions, rewards ─────────────────

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pillar public.pillar not null,
  source_type text not null,
  source_id uuid,
  base_xp numeric(6, 2) not null,
  streak_multiplier numeric(3, 2) not null default 1,
  final_xp numeric(6, 2) not null,
  game_date date not null,
  created_at timestamptz not null default now()
);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  streak_type public.streak_type not null,
  current_count int not null default 0,
  longest_count int not null default 0,
  last_completed_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, streak_type)
);

create table public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount int not null,
  reason text not null,
  related_week_start date,
  related_reward_id uuid,
  created_at timestamptz not null default now()
);

create table public.weekly_mission_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  mission_key text not null,
  completed boolean not null,
  coins_awarded int not null default 0,
  evaluated_at timestamptz not null default now(),
  unique (user_id, week_start, mission_key)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  cost_coins int not null check (cost_coins > 0),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reward_id uuid not null references public.rewards (id) on delete restrict,
  cost_coins int not null,
  redeemed_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────
-- Every table above stores its own user_id, so the same four policies
-- (select/insert/update/delete "only your own rows") apply everywhere.
-- Looping avoids repeating the same 4 statements ~24 times by hand.

do $$
declare
  t text;
  tables text[] := array[
    'user_settings', 'quarters', 'subjects', 'guides', 'exercise_progress_logs',
    'study_sessions', 'jiujitsu_sessions', 'competitions', 'competition_matches',
    'cross_training_sessions', 'projects', 'project_logs', 'meditation_logs',
    'journal_entries', 'books', 'reading_logs', 'creative_blocks', 'todos',
    'xp_events', 'streaks', 'coin_transactions', 'weekly_mission_evaluations',
    'rewards', 'reward_redemptions'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

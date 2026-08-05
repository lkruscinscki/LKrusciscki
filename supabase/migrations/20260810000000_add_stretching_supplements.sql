-- Stretching: weekly minute goal (editable per user) + session log.
alter table public.user_settings
  add column stretching_weekly_goal_minutes int not null default 20
  check (stretching_weekly_goal_minutes > 0);

create table public.stretching_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  duration_minutes int not null check (duration_minutes > 0),
  created_at timestamptz not null default now()
);

-- Suplementos: simple daily checkbox, same shape as chess_sessions.
create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

do $$
declare
  t text;
  tables text[] := array['stretching_logs', 'supplement_logs'];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- Three new simple daily/weekly habits: chess, water intake, sleep hours.

create table public.chess_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.water_intake_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  bottles_count int not null default 0 check (bottles_count >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  hours numeric(3, 1) not null check (hours >= 0 and hours <= 24),
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

do $$
declare
  t text;
  tables text[] := array['chess_sessions', 'water_intake_logs', 'sleep_logs'];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

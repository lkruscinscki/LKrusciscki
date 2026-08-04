-- Exam dates ("parciales") per subject, shown as a countdown on Inicio
-- alongside upcoming jiujitsu competitions.

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  name text not null,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.exams enable row level security;

create policy "select_own" on public.exams for select using (auth.uid() = user_id);
create policy "insert_own" on public.exams for insert with check (auth.uid() = user_id);
create policy "update_own" on public.exams for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.exams for delete using (auth.uid() = user_id);

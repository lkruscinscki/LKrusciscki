-- Gym: exercises organized by muscle group, logged as sets within one
-- workout per day. Finalizing a workout also writes a cross_training_sessions
-- row (discipline "Gym") so it keeps counting toward the existing
-- training-day calendar markers and weekly cross-training goal.

create type public.gym_muscle_group as enum (
  'pecho', 'hombros', 'espalda', 'biceps', 'triceps', 'piernas', 'accesorios'
);
create type public.gym_exercise_type as enum ('peso_libre', 'polea', 'compuesto');

alter table public.cross_training_sessions alter column duration_minutes drop not null;

create table public.gym_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  muscle_group public.gym_muscle_group not null,
  name text not null,
  exercise_type public.gym_exercise_type not null,
  created_at timestamptz not null default now()
);

create table public.gym_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_date date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table public.gym_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references public.gym_workouts (id) on delete cascade,
  exercise_id uuid not null references public.gym_exercises (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.gym_workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_exercise_id uuid not null references public.gym_workout_exercises (id) on delete cascade,
  reps int not null check (reps > 0),
  weight_kg numeric(6, 2) not null check (weight_kg >= 0),
  created_at timestamptz not null default now()
);

do $$
declare
  t text;
  tables text[] := array[
    'gym_exercises', 'gym_workouts', 'gym_workout_exercises', 'gym_workout_sets'
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

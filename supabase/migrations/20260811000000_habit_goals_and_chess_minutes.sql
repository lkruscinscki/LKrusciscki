-- Per-user editable goals for the habits that now follow the Stretching
-- pattern (collapsible card + "modificar objetivos").
alter table public.user_settings
  add column water_daily_goal_liters numeric(3, 2) not null default 3 check (water_daily_goal_liters > 0),
  add column creative_block_weekly_goal_minutes int not null default 120 check (creative_block_weekly_goal_minutes > 0),
  add column chess_weekly_goal_minutes int not null default 60 check (chess_weekly_goal_minutes > 0),
  add column sleep_daily_goal_hours numeric(3, 1) not null default 8 check (sleep_daily_goal_hours > 0);

-- Chess moves from a daily-checkbox habit to a minutes-logged, weekly-goal
-- habit like stretching/bloque creativo: multiple sessions per day allowed,
-- each with its own duration.
alter table public.chess_sessions add column duration_minutes int;
update public.chess_sessions set duration_minutes = 0 where duration_minutes is null;
alter table public.chess_sessions alter column duration_minutes set not null;
alter table public.chess_sessions add constraint chess_sessions_duration_check check (duration_minutes > 0);
alter table public.chess_sessions drop constraint chess_sessions_user_id_game_date_key;
alter table public.chess_sessions rename column game_date to date;

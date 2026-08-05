alter table public.user_settings
  add column reading_daily_goal_pages int not null default 10
  check (reading_daily_goal_pages > 0);

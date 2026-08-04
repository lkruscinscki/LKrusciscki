-- Streaks are computed live from xp_events (see lib/xp.ts) instead of
-- maintained as an incremental counter, so this table was never used.
drop table if exists public.streaks;

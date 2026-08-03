-- Journaling is done on paper; the app only needs a check, no text.
alter table public.journal_entries alter column content drop not null;

-- Reading now revolves around real books with a known page count, so
-- monthly totals can be grouped by book instead of a free-typed title.
alter table public.books add column total_pages int not null check (total_pages > 0);
alter table public.reading_logs alter column book_id set not null;

-- Creative blocks lose the free-text notes field; it's a quick check-in now,
-- tracked against a weekly minutes goal instead of a count of sessions.
alter table public.creative_blocks drop column notes;

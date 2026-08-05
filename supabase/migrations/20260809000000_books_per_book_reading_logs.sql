-- Books can now be added as "already in progress" with a starting page count.
alter table public.books add column starting_pages int not null default 0 check (starting_pages >= 0);

-- Reading logs move from one-per-day (any book) to one-per-day-per-book, so
-- progress on multiple books in parallel doesn't overwrite each other.
alter table public.reading_logs drop constraint reading_logs_user_id_game_date_key;
alter table public.reading_logs add constraint reading_logs_user_id_game_date_book_id_key unique (user_id, game_date, book_id);

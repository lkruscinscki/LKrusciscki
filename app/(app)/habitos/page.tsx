import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart, addDays, computeStreak } from "@/lib/game-day";
import {
  logMeditation,
  logJournaling,
  saveReadingLog,
  saveCreativeBlock,
  logChess,
  incrementWater,
  decrementWater,
  saveSleep,
  logSupplements,
  logStretching,
} from "./actions";
import { BookCard } from "../book-card";
import { StretchingCard } from "./stretching-card";
import { CreativeBlockCard } from "./creative-block-card";
import { ChessCard } from "./chess-card";
import { SleepCard } from "./sleep-card";
import { WaterCard } from "./water-card";

const STREAK_LOOKBACK_DAYS = 60;

function StreakBadge({ days }: { days: number }) {
  if (days === 0) return null;
  return (
    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
      🔥 {days} día{days === 1 ? "" : "s"}
    </span>
  );
}

export default async function HabitosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);
  const weekStart = getWeekStart(today);
  const streakSince = addDays(today, -STREAK_LOOKBACK_DAYS);

  const [
    { data: meditation },
    { data: journal },
    { data: booksReading },
    { data: creativeBlocksThisWeek },
    { data: chessThisWeek },
    { data: waterToday },
    { data: sleepToday },
    { data: supplementsToday },
    { data: stretchingThisWeek },
    { data: settings },
    { data: meditationStreakRows },
    { data: journalStreakRows },
    { data: readingStreakRows },
  ] = await Promise.all([
    supabase
      .from("meditation_logs")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("books")
      .select("*, reading_logs(pages_read, game_date)")
      .eq("status", "reading")
      .order("created_at"),
    supabase
      .from("creative_blocks")
      .select("duration_minutes")
      .gte("date", weekStart),
    supabase
      .from("chess_sessions")
      .select("duration_minutes")
      .gte("date", weekStart),
    supabase
      .from("water_intake_logs")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("sleep_logs")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("supplement_logs")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("stretching_logs")
      .select("duration_minutes")
      .gte("date", weekStart),
    supabase
      .from("user_settings")
      .select(
        "stretching_weekly_goal_minutes, creative_block_weekly_goal_minutes, chess_weekly_goal_minutes, sleep_daily_goal_hours, water_daily_goal_liters, reading_daily_goal_pages",
      )
      .eq("user_id", user!.id)
      .single(),
    supabase.from("meditation_logs").select("game_date").gte("game_date", streakSince),
    supabase.from("journal_entries").select("game_date").gte("game_date", streakSince),
    supabase.from("reading_logs").select("game_date").gte("game_date", streakSince),
  ]);

  const creativeMinutes = (creativeBlocksThisWeek ?? []).reduce(
    (sum, block) => sum + block.duration_minutes,
    0,
  );
  const stretchingMinutes = (stretchingThisWeek ?? []).reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );
  const chessMinutes = (chessThisWeek ?? []).reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );

  const stretchingGoal = settings?.stretching_weekly_goal_minutes ?? 20;
  const creativeGoal = settings?.creative_block_weekly_goal_minutes ?? 120;
  const chessGoal = settings?.chess_weekly_goal_minutes ?? 60;
  const sleepGoal = settings?.sleep_daily_goal_hours ?? 8;
  const waterGoal = settings?.water_daily_goal_liters ?? 3;
  const readingGoal = settings?.reading_daily_goal_pages ?? 10;

  const pagesReadToday = (booksReading ?? []).reduce((sum, book) => {
    const todayLog = book.reading_logs.find((log) => log.game_date === today);
    return sum + (todayLog?.pages_read ?? 0);
  }, 0);

  const meditationStreak = computeStreak(
    new Set((meditationStreakRows ?? []).map((r) => r.game_date)),
    today,
  );
  const journalStreak = computeStreak(
    new Set((journalStreakRows ?? []).map((r) => r.game_date)),
    today,
  );
  const readingStreak = computeStreak(
    new Set((readingStreakRows ?? []).map((r) => r.game_date)),
    today,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Hábitos</h1>

      <section className="card">
        <h2 className="mb-2 flex items-center justify-between font-medium">
          Meditación <StreakBadge days={meditationStreak} />
        </h2>
        {meditation ? (
          <div>
            <div className="flex items-center gap-2 rounded-lg bg-black/5 px-4 py-2.5 text-sm text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
              <span className="text-accent">✓</span> Hecho hoy
            </div>
            <p className="mt-2 text-sm text-accent">
              🧘 Un momento de calma en el día. Bien ahí.
            </p>
          </div>
        ) : (
          <form action={logMeditation}>
            <button type="submit" className="btn-primary w-full">
              Medité hoy
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 flex items-center justify-between font-medium">
          Journaling <StreakBadge days={journalStreak} />
        </h2>
        {journal ? (
          <div>
            <div className="flex items-center gap-2 rounded-lg bg-black/5 px-4 py-2.5 text-sm text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
              <span className="text-accent">✓</span> Hecho hoy
            </div>
            <p className="mt-2 text-sm text-accent">
              ✍️ Otro día documentado. Tu yo futuro te lo va a agradecer.
            </p>
          </div>
        ) : (
          <form action={logJournaling}>
            <button type="submit" className="btn-primary w-full">
              Escribí hoy
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Tomar suplementos</h2>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          Creatina y Omega 3
        </p>
        {supplementsToday ? (
          <div>
            <div className="flex items-center gap-2 rounded-lg bg-black/5 px-4 py-2.5 text-sm text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
              <span className="text-accent">✓</span> Hecho hoy
            </div>
            <p className="mt-2 text-sm text-accent">
              💊 Tu cuerpo te lo agradece. Seguí así.
            </p>
          </div>
        ) : (
          <form action={logSupplements}>
            <button type="submit" className="btn-primary w-full">
              Tomé mis suplementos
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 flex items-center justify-between font-medium">
          Lectura <StreakBadge days={readingStreak} />
        </h2>
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          {pagesReadToday}/{readingGoal} páginas leídas hoy
        </p>

        {booksReading && booksReading.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-2">
            {booksReading.map((book) => {
              const cumulative =
                book.starting_pages +
                book.reading_logs.reduce((sum, log) => sum + log.pages_read, 0);
              return (
                <BookCard
                  key={book.id}
                  book={{
                    id: book.id,
                    title: book.title,
                    totalPages: book.total_pages,
                    cumulative,
                  }}
                  action={saveReadingLog}
                />
              );
            })}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-zinc-400">
            Todavía no agregaste ningún libro.
          </p>
        )}

        <Link href="/libros" className="btn-secondary block text-center">
          Agregar o editar libros
        </Link>
      </section>

      <section className="card">
        <CreativeBlockCard
          weeklyMinutes={creativeMinutes}
          goalMinutes={creativeGoal}
          action={saveCreativeBlock}
        />
      </section>

      <section className="card">
        <ChessCard
          weeklyMinutes={chessMinutes}
          goalMinutes={chessGoal}
          action={logChess}
        />
      </section>

      <section className="card">
        <StretchingCard
          weeklyMinutes={stretchingMinutes}
          goalMinutes={stretchingGoal}
          action={logStretching}
        />
      </section>

      <section className="card">
        <WaterCard
          bottlesToday={waterToday?.bottles_count ?? 0}
          goalLiters={waterGoal}
          incrementAction={incrementWater}
          decrementAction={decrementWater}
        />
      </section>

      <section className="card">
        <SleepCard
          hoursToday={sleepToday?.hours ?? 0}
          goalHours={sleepGoal}
          action={saveSleep}
        />
      </section>
    </div>
  );
}

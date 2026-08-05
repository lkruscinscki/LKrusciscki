import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart, addDays, computeStreak } from "@/lib/game-day";
import { WEEKLY_GOALS } from "@/lib/game-config";
import {
  logMeditation,
  logJournaling,
  saveReadingLog,
  saveCreativeBlock,
  logChess,
  undoChess,
  incrementWater,
  decrementWater,
  saveSleep,
} from "./actions";
import { BookCard } from "./book-card";

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
    { data: chessToday },
    { data: chessThisWeek },
    { data: waterToday },
    { data: sleepToday },
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
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
    supabase
      .from("chess_sessions")
      .select("game_date")
      .gte("game_date", weekStart),
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
    supabase.from("meditation_logs").select("game_date").gte("game_date", streakSince),
    supabase.from("journal_entries").select("game_date").gte("game_date", streakSince),
    supabase.from("reading_logs").select("game_date").gte("game_date", streakSince),
  ]);

  const creativeMinutes = (creativeBlocksThisWeek ?? []).reduce(
    (sum, block) => sum + block.duration_minutes,
    0,
  );

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
        <h2 className="mb-2 flex items-center justify-between font-medium">
          Lectura <StreakBadge days={readingStreak} />
        </h2>

        {booksReading && booksReading.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-2">
            {booksReading.map((book) => {
              const cumulative =
                book.starting_pages +
                book.reading_logs.reduce((sum, log) => sum + log.pages_read, 0);
              const todayLog = book.reading_logs.find(
                (log) => log.game_date === today,
              );
              return (
                <BookCard
                  key={book.id}
                  book={{
                    id: book.id,
                    title: book.title,
                    totalPages: book.total_pages,
                    cumulative,
                  }}
                  todayPages={todayLog?.pages_read ?? 0}
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
        <h2 className="mb-2 font-medium">
          Bloque creativo · {creativeMinutes}/
          {WEEKLY_GOALS.creativeBlockMinutes} min esta semana
        </h2>
        <form action={saveCreativeBlock} className="flex gap-2">
          <input
            name="activity"
            placeholder="Actividad (ej. guitarra)"
            required
            className="input flex-1"
          />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Minutos"
            min={1}
            required
            className="input w-24"
          />
          <button type="submit" className="btn-primary">
            Registrar
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">
          Ajedrez · {chessThisWeek?.length ?? 0} esta semana
        </h2>
        {chessToday ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-accent">✓ Jugado hoy</p>
            <form action={undoChess}>
              <button type="submit" className="text-sm text-zinc-400 underline">
                deshacer
              </button>
            </form>
          </div>
        ) : (
          <form action={logChess}>
            <button type="submit" className="btn-primary w-full">
              Jugué ajedrez hoy
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Agua</h2>
        <div className="flex items-center justify-between gap-3">
          <form action={decrementWater}>
            <button
              type="submit"
              className="btn-secondary h-11 w-11 !p-0 text-lg"
            >
              −
            </button>
          </form>
          <div className="text-center">
            <span className="text-2xl font-semibold">
              {waterToday?.bottles_count ?? 0}
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              botellas (750ml) ·{" "}
              {(((waterToday?.bottles_count ?? 0) * 750) / 1000).toFixed(2)} L
            </p>
          </div>
          <form action={incrementWater}>
            <button
              type="submit"
              className="btn-primary h-11 w-11 !p-0 text-lg"
            >
              +
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Sueño</h2>
        <form action={saveSleep} className="flex gap-2">
          <input
            type="number"
            name="hours"
            step={0.5}
            min={0}
            max={24}
            defaultValue={sleepToday?.hours ?? ""}
            placeholder="Horas dormidas"
            required
            className="input flex-1"
          />
          <button type="submit" className="btn-primary">
            {sleepToday ? "Actualizar" : "Guardar"}
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-400">
          Carga manual por ahora — más adelante lo conectamos con tu wearable.
        </p>
      </section>
    </div>
  );
}

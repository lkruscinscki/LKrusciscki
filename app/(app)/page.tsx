import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart } from "@/lib/game-day";
import {
  logMeditation,
  undoMeditation,
  logJournaling,
  undoJournaling,
  addBook,
  saveReadingLog,
  saveCreativeBlock,
  logChess,
  undoChess,
  incrementWater,
  decrementWater,
  saveSleep,
} from "./actions";

// TODO(fase 4): mover a lib/game-config.ts junto con el resto de objetivos.
const WEEKLY_CREATIVE_GOAL_MINUTES = 120;

export default async function HabitosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);
  const weekStart = getWeekStart(today);

  const [
    { data: meditation },
    { data: journal },
    { data: booksReading },
    { data: todayReadingLog },
    { data: creativeBlocksThisWeek },
    { data: chessToday },
    { data: chessThisWeek },
    { data: waterToday },
    { data: sleepToday },
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
      .select("*, reading_logs(pages_read)")
      .eq("status", "reading")
      .order("created_at"),
    supabase
      .from("reading_logs")
      .select("*")
      .eq("game_date", today)
      .maybeSingle(),
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
  ]);

  const creativeMinutes = (creativeBlocksThisWeek ?? []).reduce(
    (sum, block) => sum + block.duration_minutes,
    0,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Hábitos</h1>

      <section className="card">
        <h2 className="mb-2 font-medium">Meditación</h2>
        {meditation ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-accent">
              ✓ Hecho hoy
              {meditation.duration_minutes
                ? ` · ${meditation.duration_minutes} min`
                : ""}
            </p>
            <form action={undoMeditation}>
              <button type="submit" className="text-sm text-zinc-400 underline">
                deshacer
              </button>
            </form>
          </div>
        ) : (
          <form action={logMeditation} className="flex items-center gap-2">
            <input
              type="number"
              name="duration_minutes"
              placeholder="min (opcional)"
              min={1}
              className="input w-28"
            />
            <button type="submit" className="btn-primary flex-1">
              Medité hoy
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Journaling</h2>
        {journal ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-accent">✓ Hecho hoy</p>
            <form action={undoJournaling}>
              <button type="submit" className="text-sm text-zinc-400 underline">
                deshacer
              </button>
            </form>
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
        <h2 className="mb-2 font-medium">Lectura</h2>

        {booksReading && booksReading.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-1">
            {booksReading.map((book) => {
              const pagesRead = book.reading_logs.reduce(
                (sum, log) => sum + log.pages_read,
                0,
              );
              return (
                <li
                  key={book.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{book.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {pagesRead}/{book.total_pages} pág.
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-zinc-400">
            Todavía no agregaste ningún libro.
          </p>
        )}

        {booksReading && booksReading.length > 0 && (
          <form
            action={saveReadingLog}
            className="mb-4 flex flex-col gap-2 border-t border-black/10 pt-3 dark:border-white/10"
          >
            <select
              name="book_id"
              defaultValue={todayReadingLog?.book_id ?? ""}
              required
              className="input"
            >
              <option value="" disabled>
                Elegí un libro
              </option>
              {booksReading.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                name="pages_read"
                defaultValue={todayReadingLog?.pages_read ?? ""}
                placeholder="Páginas leídas hoy"
                min={1}
                required
                className="input flex-1"
              />
              <button type="submit" className="btn-primary">
                {todayReadingLog ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        )}

        <form
          action={addBook}
          className="flex gap-2 border-t border-black/10 pt-3 text-sm dark:border-white/10"
        >
          <input
            name="title"
            placeholder="Nuevo libro (ej. El Principito)"
            required
            className="input flex-1"
          />
          <input
            type="number"
            name="total_pages"
            placeholder="Páginas"
            min={1}
            required
            className="input w-24"
          />
          <button type="submit" className="btn-secondary">
            +
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">
          Bloque creativo · {creativeMinutes}/{WEEKLY_CREATIVE_GOAL_MINUTES}{" "}
          min esta semana
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

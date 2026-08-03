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
} from "./actions";

// TODO(fase 4): mover a lib/game-config.ts junto con el resto de objetivos.
const WEEKLY_CREATIVE_GOAL_MINUTES = 120;

export default async function HoyPage() {
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
  ]);

  const creativeMinutes = (creativeBlocksThisWeek ?? []).reduce(
    (sum, block) => sum + block.duration_minutes,
    0,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Hoy</h1>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-2 font-medium">Meditación</h2>
        {meditation ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700 dark:text-green-400">
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
              className="w-28 rounded border border-black/20 px-2 py-2 text-sm dark:border-white/20"
            />
            <button
              type="submit"
              className="flex-1 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Medité hoy
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-2 font-medium">Journaling</h2>
        {journal ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ Hecho hoy
            </p>
            <form action={undoJournaling}>
              <button type="submit" className="text-sm text-zinc-400 underline">
                deshacer
              </button>
            </form>
          </div>
        ) : (
          <form action={logJournaling}>
            <button
              type="submit"
              className="w-full rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Escribí hoy
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
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
              className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
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
                className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
              />
              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
              >
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
            className="flex-1 rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
          <input
            type="number"
            name="total_pages"
            placeholder="Páginas"
            min={1}
            required
            className="w-24 rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
          <button
            type="submit"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          >
            +
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-2 font-medium">
          Bloque creativo · {creativeMinutes}/{WEEKLY_CREATIVE_GOAL_MINUTES}{" "}
          min esta semana
        </h2>
        <form action={saveCreativeBlock} className="flex gap-2">
          <input
            name="activity"
            placeholder="Actividad (ej. guitarra)"
            required
            className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Minutos"
            min={1}
            required
            className="w-24 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Registrar
          </button>
        </form>
      </section>
    </div>
  );
}

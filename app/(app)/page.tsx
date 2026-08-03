import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart } from "@/lib/game-day";
import {
  logMeditation,
  undoMeditation,
  saveJournalEntry,
  saveReadingLog,
  saveCreativeBlock,
} from "./actions";

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
    { data: reading },
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
      .from("reading_logs")
      .select("*, books(title)")
      .eq("game_date", today)
      .maybeSingle(),
    supabase.from("creative_blocks").select("id").gte("date", weekStart),
  ]);

  const creativeCount = creativeBlocksThisWeek?.length ?? 0;

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
        <form action={saveJournalEntry} className="flex flex-col gap-2">
          <textarea
            name="content"
            defaultValue={journal?.content ?? ""}
            placeholder="Escribí tu entrada de hoy..."
            rows={4}
            className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            className="self-end rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            {journal ? "Actualizar" : "Guardar"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-2 font-medium">
          Lectura {reading && reading.pages_read >= 10 ? "✓" : ""}
        </h2>
        <form action={saveReadingLog} className="flex flex-col gap-2">
          <input
            name="book_title"
            defaultValue={reading?.books?.title ?? ""}
            placeholder="Libro (opcional)"
            className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <div className="flex gap-2">
            <input
              type="number"
              name="pages_read"
              defaultValue={reading?.pages_read ?? ""}
              placeholder="Páginas leídas hoy"
              min={1}
              className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              {reading ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-2 font-medium">
          Bloque creativo · {creativeCount}/2 esta semana
        </h2>
        <form action={saveCreativeBlock} className="flex flex-col gap-2">
          <input
            name="activity"
            placeholder="Actividad (ej. guitarra)"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <div className="flex gap-2">
            <input
              type="number"
              name="duration_minutes"
              placeholder="Minutos"
              min={1}
              required
              className="w-28 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <input
              name="notes"
              placeholder="Nota (opcional)"
              className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Registrar bloque
          </button>
        </form>
      </section>
    </div>
  );
}

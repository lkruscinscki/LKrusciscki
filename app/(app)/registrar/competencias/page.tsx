import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { addCompetition } from "./actions";

export default async function CompetenciasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*, competition_matches(id)")
    .order("date", { ascending: false });

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Competencias</h1>

      <section className="flex flex-col gap-2">
        {competitions && competitions.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {competitions.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/registrar/competencias/${c.id}`}
                  className="block rounded border border-black/10 p-3 dark:border-white/10"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{c.event_name}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {c.date}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {c.competition_matches.length} combate
                    {c.competition_matches.length === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">
            Todavía no cargaste ninguna competencia.
          </p>
        )}
      </section>

      <form
        action={addCompetition}
        className="flex flex-col gap-2 border-t border-black/10 pt-4 dark:border-white/10"
      >
        <h2 className="font-medium">Nueva competencia</h2>
        <input
          name="event_name"
          placeholder="Evento"
          required
          className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          name="category"
          placeholder="Categoría (opcional)"
          className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          type="date"
          name="date"
          defaultValue={today}
          required
          className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <textarea
          name="notes"
          placeholder="Notas (opcional)"
          rows={3}
          className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          className="self-end rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Crear y agregar combates
        </button>
      </form>
    </div>
  );
}

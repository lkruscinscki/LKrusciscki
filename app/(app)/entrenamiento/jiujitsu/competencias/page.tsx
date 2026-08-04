import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, daysBetween } from "@/lib/game-day";
import { addCompetition } from "./actions";
import { BackLink } from "../back-link";

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

  const upcoming = (competitions ?? []).filter((c) => c.date > today);
  const ready = (competitions ?? []).filter((c) => c.date <= today);

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/jiujitsu" />
      <h1 className="text-2xl font-semibold">Competencias</h1>

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Próximas
          </h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((c) => {
              const days = daysBetween(today, c.date);
              return (
                <li key={c.id}>
                  <Link
                    href={`/entrenamiento/jiujitsu/competencias/${c.id}`}
                    className="card block"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{c.event_name}</span>
                      <span className="text-sm text-accent">
                        {days === 0 ? "hoy" : `${days}d`}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {c.date}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Para cargar resultado
        </h2>
        {ready.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {ready.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/entrenamiento/jiujitsu/competencias/${c.id}`}
                  className="card block"
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
            Todavía no cargaste ninguna competencia pasada.
          </p>
        )}
      </section>

      <form
        action={addCompetition}
        className="flex flex-col gap-2 border-t border-black/10 pt-4 dark:border-white/10"
      >
        <h2 className="font-medium">Agregar torneo</h2>
        <input name="event_name" placeholder="Evento" required className="input" />
        <input name="category" placeholder="Categoría (opcional)" className="input" />
        <input
          type="date"
          name="date"
          defaultValue={today}
          required
          className="input"
        />
        <textarea name="notes" placeholder="Notas (opcional)" rows={3} className="input" />
        <button type="submit" className="btn-primary self-end">
          Agregar
        </button>
      </form>
    </div>
  );
}

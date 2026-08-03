import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, daysBetween } from "@/lib/game-day";
import { addJiujitsuSession } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open mat",
};

export default async function JiujitsuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const [{ data: recentSessions }, { data: nextCompetitions }] =
    await Promise.all([
      supabase
        .from("jiujitsu_sessions")
        .select("*")
        .order("date", { ascending: false })
        .limit(5),
      supabase
        .from("competitions")
        .select("*")
        .gte("date", today)
        .order("date")
        .limit(1),
    ]);

  const nextCompetition = nextCompetitions?.[0];
  const daysUntil = nextCompetition
    ? daysBetween(today, nextCompetition.date)
    : null;

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Jiujitsu</h1>

      <Link href="/entrenamiento/jiujitsu/competencias" className="card block">
        {nextCompetition ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Próxima competencia
            </p>
            <p className="font-medium">{nextCompetition.event_name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {daysUntil === 0
                ? "¡Es hoy!"
                : `Faltan ${daysUntil} día${daysUntil === 1 ? "" : "s"}`}{" "}
              · {nextCompetition.date}
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Competencias →
          </p>
        )}
      </Link>

      <form action={addJiujitsuSession} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Fecha
          <input
            type="date"
            name="date"
            defaultValue={today}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select name="type" required defaultValue="gi" className="input">
            <option value="gi">Gi</option>
            <option value="no_gi">No-Gi</option>
            <option value="open_mat">Open mat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Duración (min)
          <input
            type="number"
            name="duration_minutes"
            min={1}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Rondas de sparring
          <input
            type="number"
            name="sparring_rounds"
            min={0}
            defaultValue={0}
            className="input"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Sumisiones logradas
            <input
              type="number"
              name="submissions_achieved"
              min={0}
              defaultValue={0}
              className="input"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Sumisiones recibidas
            <input
              type="number"
              name="submissions_received"
              min={0}
              defaultValue={0}
              className="input"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Técnicas nuevas
          <input name="new_techniques" placeholder="Opcional" className="input" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notas
          <textarea
            name="notes"
            rows={4}
            placeholder="¿Cómo estuvo la sesión?"
            className="input"
          />
        </label>

        <button type="submit" className="btn-primary">
          Guardar sesión
        </button>
      </form>

      {recentSessions && recentSessions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-black/10 pt-4 dark:border-white/10">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Últimas sesiones
          </h2>
          <ul className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <li key={s.id} className="card text-sm">
                <div className="flex justify-between">
                  <span>
                    {s.date} · {TYPE_LABELS[s.type]}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {s.duration_minutes} min
                  </span>
                </div>
                <div className="text-zinc-500 dark:text-zinc-400">
                  {s.submissions_achieved} sumisiones · {s.submissions_received}{" "}
                  recibidas
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

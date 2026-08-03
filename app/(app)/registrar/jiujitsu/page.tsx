import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
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

  const { data: recentSessions } = await supabase
    .from("jiujitsu_sessions")
    .select("*")
    .order("date", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Jiujitsu</h1>

      <form action={addJiujitsuSession} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Fecha
          <input
            type="date"
            name="date"
            defaultValue={today}
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select
            name="type"
            required
            defaultValue="gi"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          >
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
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Rondas de sparring
          <input
            type="number"
            name="sparring_rounds"
            min={0}
            defaultValue={0}
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
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
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Sumisiones recibidas
            <input
              type="number"
              name="submissions_received"
              min={0}
              defaultValue={0}
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Técnicas nuevas
          <input
            name="new_techniques"
            placeholder="Opcional"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notas
          <textarea
            name="notes"
            rows={4}
            placeholder="¿Cómo estuvo la sesión?"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
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
              <li
                key={s.id}
                className="rounded border border-black/10 p-3 text-sm dark:border-white/10"
              >
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

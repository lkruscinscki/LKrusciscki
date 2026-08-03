import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { addCrossTraining } from "./actions";

export default async function CrossTrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: recentSessions } = await supabase
    .from("cross_training_sessions")
    .select("*")
    .order("date", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Cross-training</h1>

      <form action={addCrossTraining} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Disciplina
          <input
            name="discipline"
            placeholder="Gym, running, escalada..."
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </label>

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
          Nota
          <input
            name="notes"
            placeholder="Opcional"
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
                    {s.date} · {s.discipline}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {s.duration_minutes} min
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { addCrossTrainingSession } from "./actions";

const DISCIPLINES: Record<string, string> = {
  gym: "Gym",
  escalada: "Escalada",
  running: "Running",
};

export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline: slug } = await params;
  const label = DISCIPLINES[slug];

  if (!label) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: recentSessions } = await supabase
    .from("cross_training_sessions")
    .select("*")
    .eq("discipline", label)
    .order("date", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">{label}</h1>

      <form action={addCrossTrainingSession} className="flex flex-col gap-3">
        <input type="hidden" name="discipline" value={label} />
        <input type="hidden" name="slug" value={slug} />

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
          Nota
          <input name="notes" placeholder="Opcional" className="input" />
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
                  <span>{s.date}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {s.duration_minutes} min
                  </span>
                </div>
                {s.notes && (
                  <p className="text-zinc-500 dark:text-zinc-400">{s.notes}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

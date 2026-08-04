import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart } from "@/lib/game-day";
import { addQuarter, addSubject } from "./actions";

function semaforoEmoji(progress: number, goal: number): string {
  if (progress >= goal) return "🟢";
  if (progress > 0) return "🟡";
  return "🔴";
}

export default async function MateriasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);
  const weekStart = getWeekStart(today);

  const [{ data: quarters }, { data: subjects }, { data: weekLogs }] =
    await Promise.all([
      supabase.from("quarters").select("*").order("start_date", { ascending: false }),
      supabase
        .from("subjects")
        .select("*, quarters(name)")
        .order("created_at"),
      supabase
        .from("exercise_progress_logs")
        .select("subject_id, exercises_added")
        .gte("game_date", weekStart),
    ]);

  const weekProgressBySubject = new Map<string, number>();
  for (const log of weekLogs ?? []) {
    weekProgressBySubject.set(
      log.subject_id,
      (weekProgressBySubject.get(log.subject_id) ?? 0) + log.exercises_added,
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Materias</h1>

      <section className="flex flex-col gap-2">
        {subjects && subjects.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {subjects.map((subject) => {
              const progress = weekProgressBySubject.get(subject.id) ?? 0;
              return (
                <li key={subject.id}>
                  <Link
                    href={`/materias/${subject.id}`}
                    className="card flex items-center gap-3"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {subject.quarters?.name}
                      </p>
                    </div>
                    <span className="text-lg">
                      {semaforoEmoji(progress, subject.weekly_exercise_goal)}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {progress}/{subject.weekly_exercise_goal}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">
            Todavía no cargaste ninguna materia.
          </p>
        )}
      </section>

      {quarters && quarters.length > 0 ? (
        <section className="card">
          <h2 className="mb-2 font-medium">Nueva materia</h2>
          <form action={addSubject} className="flex flex-col gap-2">
            <input name="name" placeholder="Nombre" required className="input" />
            <select name="quarter_id" required defaultValue={quarters[0].id} className="input">
              {quarters.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2 text-sm">
                Color
                <input
                  type="color"
                  name="color"
                  defaultValue="#ea580c"
                  className="h-10 w-14 rounded border border-black/20 dark:border-white/20"
                />
              </label>
              <input
                type="number"
                name="weekly_exercise_goal"
                placeholder="Objetivo semanal"
                min={1}
                defaultValue={10}
                className="input flex-1"
              />
            </div>
            <button type="submit" className="btn-primary self-end">
              Crear materia
            </button>
          </form>
        </section>
      ) : (
        <p className="text-sm text-zinc-400">
          Creá un cuatrimestre primero para poder agregar materias.
        </p>
      )}

      <section className="card">
        <h2 className="mb-2 font-medium">Cuatrimestres</h2>
        {quarters && quarters.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1 text-sm">
            {quarters.map((q) => (
              <li key={q.id} className="flex justify-between">
                <span>{q.name}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {q.start_date} — {q.end_date}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form action={addQuarter} className="flex flex-col gap-2 border-t border-black/10 pt-3 dark:border-white/10">
          <input name="name" placeholder="Nombre (ej. 2026-2)" required className="input" />
          <div className="flex gap-2">
            <input type="date" name="start_date" required className="input flex-1" />
            <input type="date" name="end_date" required className="input flex-1" />
          </div>
          <button type="submit" className="btn-secondary self-end">
            Agregar cuatrimestre
          </button>
        </form>
      </section>
    </div>
  );
}

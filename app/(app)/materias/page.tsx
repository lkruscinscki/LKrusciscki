import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart } from "@/lib/game-day";
import { BackLink } from "../back-link";

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

  const activeQuarter = (quarters ?? []).find(
    (q) => q.start_date <= today && today <= q.end_date,
  );

  const weekProgressBySubject = new Map<string, number>();
  for (const log of weekLogs ?? []) {
    weekProgressBySubject.set(
      log.subject_id,
      (weekProgressBySubject.get(log.subject_id) ?? 0) + log.exercises_added,
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/inicio" />
      <h1 className="text-2xl font-semibold">Materias</h1>

      <section className="card flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Cuatrimestre actual
          </p>
          {activeQuarter ? (
            <>
              <p className="text-lg font-semibold">{activeQuarter.name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Vigente hasta {activeQuarter.end_date}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No hay ninguno vigente
            </p>
          )}
        </div>
        <Link href="/materias/cuatrimestre" className="text-sm text-accent">
          modificar
        </Link>
      </section>

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
            Todavía no cargaste ninguna materia.{" "}
            <Link href="/materias/cuatrimestre" className="text-accent">
              Agregar
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

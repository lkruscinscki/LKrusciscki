import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart } from "@/lib/game-day";
import { BackLink } from "../../back-link";
import { addGuide, markExercisesResolved, addStudySession } from "./actions";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);
  const weekStart = getWeekStart(today);

  const { data: subject } = await supabase
    .from("subjects")
    .select("*, quarters(name)")
    .eq("id", id)
    .maybeSingle();

  if (!subject) {
    notFound();
  }

  const [{ data: guides }, { data: weekLogs }, { data: recentSessions }] =
    await Promise.all([
      supabase
        .from("guides")
        .select("*")
        .eq("subject_id", id)
        .order("created_at"),
      supabase
        .from("exercise_progress_logs")
        .select("exercises_added")
        .eq("subject_id", id)
        .gte("game_date", weekStart),
      supabase
        .from("study_sessions")
        .select("*")
        .eq("subject_id", id)
        .order("date", { ascending: false })
        .limit(5),
    ]);

  const weekProgress = (weekLogs ?? []).reduce(
    (sum, l) => sum + l.exercises_added,
    0,
  );
  const openGuides = (guides ?? []).filter((g) => !g.completed_at);

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/materias" />

      <div className="flex items-center gap-2">
        <span
          className="h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
        <div>
          <h1 className="text-2xl font-semibold">{subject.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {subject.quarters?.name}
          </p>
        </div>
      </div>

      <section className="card">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ejercicios esta semana
        </p>
        <p className="text-2xl font-semibold">
          {weekProgress}/{subject.weekly_exercise_goal}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Guías</h2>
        {guides && guides.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {guides.map((guide) => (
              <li key={guide.id} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {guide.name}
                    {guide.completed_at ? " ✓" : ""}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {guide.completed_exercises}/{guide.total_exercises}
                  </span>
                </div>
                {guide.target_date && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Objetivo: {guide.target_date}
                  </p>
                )}
                {!guide.completed_at && (
                  <form
                    action={markExercisesResolved}
                    className="mt-2 flex gap-2"
                  >
                    <input type="hidden" name="guide_id" value={guide.id} />
                    <input type="hidden" name="subject_id" value={id} />
                    <input
                      type="number"
                      name="exercises_added"
                      placeholder="Ejercicios resueltos"
                      min={1}
                      required
                      className="input flex-1"
                    />
                    <button type="submit" className="btn-primary">
                      +
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">
            Todavía no cargaste ninguna guía.
          </p>
        )}

        <form
          action={addGuide}
          className="card flex flex-col gap-2 text-sm"
        >
          <input type="hidden" name="subject_id" value={id} />
          <input name="name" placeholder="Nombre de la guía" required className="input" />
          <div className="flex gap-2">
            <input
              type="number"
              name="total_exercises"
              placeholder="Total de ejercicios"
              min={1}
              required
              className="input flex-1"
            />
            <input type="date" name="target_date" className="input flex-1" />
          </div>
          <button type="submit" className="btn-secondary self-end">
            Agregar guía
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Nueva sesión de estudio</h2>
        <form action={addStudySession} className="flex flex-col gap-2">
          <input type="hidden" name="subject_id" value={id} />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Duración (min)"
            min={1}
            required
            className="input"
          />
          {openGuides.length > 0 && (
            <select name="guide_id" defaultValue="" className="input">
              <option value="">Sin guía asociada</option>
              {openGuides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
          <input name="topic" placeholder="Tema (opcional)" className="input" />
          <textarea
            name="notes"
            placeholder="Notas (opcional)"
            rows={3}
            className="input"
          />
          <button type="submit" className="btn-primary self-end">
            Guardar sesión
          </button>
        </form>
      </section>

      {recentSessions && recentSessions.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Últimas sesiones</h2>
          <ul className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <li key={s.id} className="card text-sm">
                <div className="flex justify-between">
                  <span>{s.date}{s.topic ? ` · ${s.topic}` : ""}</span>
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
        </section>
      )}
    </div>
  );
}

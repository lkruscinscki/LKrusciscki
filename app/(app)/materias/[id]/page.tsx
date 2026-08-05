import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, getWeekStart, daysBetween } from "@/lib/game-day";
import { BackLink } from "../../back-link";
import { saveGuideProgress } from "./actions";
import { GuideExerciseGrid } from "./guide-exercise-grid";

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

  const [{ data: guides }, { data: weekLogs }, { data: exams }] =
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
        .from("exams")
        .select("*")
        .eq("subject_id", id)
        .order("date"),
    ]);

  const weekProgress = (weekLogs ?? []).reduce(
    (sum, l) => sum + l.exercises_added,
    0,
  );
  const upcomingExams = (exams ?? []).filter((e) => e.date >= today).slice(0, 2);

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/materias" />

      <div className="flex items-center gap-2">
        <span
          className="h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{subject.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {subject.quarters?.name}
          </p>
        </div>
        <Link href={`/materias/${id}/editar`} className="text-sm text-accent">
          editar
        </Link>
      </div>

      <section className="card">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ejercicios esta semana
        </p>
        <p className="text-2xl font-semibold">
          {weekProgress}/{subject.weekly_exercise_goal}
        </p>
      </section>

      {upcomingExams.length > 0 && (
        <section className="card">
          <ul className="flex flex-col gap-1 text-sm">
            {upcomingExams.map((exam) => {
              const days = daysBetween(today, exam.date);
              return (
                <li key={exam.id} className="flex items-center justify-between">
                  <span>📝 {exam.name}</span>
                  <span className="text-accent">
                    {days === 0 ? "hoy" : `Faltan ${days}d`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Guías</h2>
        {guides && guides.length > 0 && (
          <ul className="flex flex-col gap-2">
            {guides.map((guide) => (
              <li key={guide.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {guide.name}
                    {guide.completed_at ? " ✓" : ""}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {guide.completed_exercises}/{guide.total_exercises}
                    <Link
                      href={`/materias/${id}/guias/${guide.id}/editar`}
                      className="text-accent"
                    >
                      editar
                    </Link>
                  </span>
                </div>
                <GuideExerciseGrid
                  guideId={guide.id}
                  subjectId={id}
                  totalExercises={guide.total_exercises}
                  completedExercises={guide.completed_exercises}
                  action={saveGuideProgress}
                />
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/materias/${id}/guias/nueva`}
          className="btn-secondary text-center"
        >
          + Agregar guía
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Parciales</h2>
        {exams && exams.length > 0 && (
          <ul className="flex flex-col gap-2">
            {exams.map((exam) => {
              const isPast = exam.date < today;
              const days = daysBetween(today, exam.date);
              return (
                <li key={exam.id}>
                  <Link
                    href={`/materias/${id}/parciales/${exam.id}/editar`}
                    className="card flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        {exam.date}
                      </p>
                    </div>
                    {!isPast && (
                      <span className="text-accent">
                        {days === 0 ? "hoy" : `${days}d`}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href={`/materias/${id}/parciales/nueva`}
          className="btn-secondary text-center"
        >
          + Agregar parcial
        </Link>
      </section>
    </div>
  );
}

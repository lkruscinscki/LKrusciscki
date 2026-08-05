import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../back-link";
import { MUSCLE_GROUPS } from "../muscle-groups";
import { ExerciseProgressChart } from "../exercise-progress-chart";

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export default async function GymEstadisticasPage() {
  const supabase = await createClient();

  const [{ data: exercises }, { data: setsRaw }] = await Promise.all([
    supabase.from("gym_exercises").select("id, name, muscle_group").order("created_at"),
    supabase
      .from("gym_workout_sets")
      .select(
        "reps, weight_kg, gym_workout_exercises(exercise_id, gym_workouts(game_date))",
      )
      .order("created_at"),
  ]);

  const maxByExerciseDate = new Map<string, Map<string, number>>();
  for (const row of setsRaw ?? []) {
    const exerciseId = row.gym_workout_exercises?.exercise_id;
    const date = row.gym_workout_exercises?.gym_workouts?.game_date;
    if (!exerciseId || !date) continue;
    const byDate = maxByExerciseDate.get(exerciseId) ?? new Map<string, number>();
    byDate.set(date, Math.max(byDate.get(date) ?? 0, row.weight_kg));
    maxByExerciseDate.set(exerciseId, byDate);
  }

  type ExerciseProgress = {
    id: string;
    name: string;
    data: { dateLabel: string; weightKg: number }[];
  };

  const exercisesByGroup = new Map<string, ExerciseProgress[]>();

  for (const ex of exercises ?? []) {
    const byDate = maxByExerciseDate.get(ex.id);
    if (!byDate || byDate.size === 0) continue;

    const data = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, weightKg]) => ({ dateLabel: formatDateLabel(date), weightKg }));

    const list = exercisesByGroup.get(ex.muscle_group) ?? [];
    list.push({ id: ex.id, name: ex.name, data });
    exercisesByGroup.set(ex.muscle_group, list);
  }

  const groupsWithData = MUSCLE_GROUPS.filter((g) => exercisesByGroup.has(g.slug));

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym" />
      <h1 className="text-2xl font-semibold">Estadísticas</h1>

      {groupsWithData.length > 0 ? (
        groupsWithData.map((group) => (
          <section key={group.slug} className="card">
            <h2 className="mb-3 font-medium">{group.label}</h2>
            <div className="flex flex-col gap-4">
              {exercisesByGroup.get(group.slug)!.map((ex) => (
                <div key={ex.id}>
                  <p className="mb-1 text-sm font-medium">{ex.name}</p>
                  <ExerciseProgressChart data={ex.data} />
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="text-sm text-zinc-400">
          Todavía no hay series registradas. Terminá un entrenamiento para ver tu
          progreso acá.
        </p>
      )}
    </div>
  );
}

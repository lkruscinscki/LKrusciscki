import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../../back-link";
import { MUSCLE_GROUP_LABELS } from "../../muscle-groups";
import { deleteSet, updateSet } from "../../actions";
import { SetRow } from "../../set-row";

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function GymHistorialDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;

  const supabase = await createClient();
  const { data: workout } = await supabase
    .from("gym_workouts")
    .select("id, game_date, completed_at")
    .eq("id", workoutId)
    .maybeSingle();

  if (!workout || !workout.completed_at) notFound();

  const { data: workoutExercises } = await supabase
    .from("gym_workout_exercises")
    .select("id, gym_exercises(name, muscle_group)")
    .eq("workout_id", workout.id)
    .order("created_at");

  const weIds = (workoutExercises ?? []).map((we) => we.id);
  const { data: sets } =
    weIds.length > 0
      ? await supabase
          .from("gym_workout_sets")
          .select("id, workout_exercise_id, reps, weight_kg")
          .in("workout_exercise_id", weIds)
          .order("created_at")
      : { data: [] };

  const revalidatePathValue = `/entrenamiento/gym/historial/${workout.id}`;

  const exercises = (workoutExercises ?? []).map((we) => ({
    id: we.id,
    name: we.gym_exercises?.name ?? "",
    muscleGroup: we.gym_exercises
      ? MUSCLE_GROUP_LABELS[we.gym_exercises.muscle_group]
      : "",
    sets: (sets ?? []).filter((s) => s.workout_exercise_id === we.id),
  }));

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym/historial" />
      <h1 className="text-2xl font-semibold capitalize">
        {formatDateLabel(workout.game_date)}
      </h1>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Este entrenamiento no tiene ejercicios registrados.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {exercises.map((ex) => (
            <section key={ex.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">{ex.name}</h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {ex.muscleGroup}
                </span>
              </div>

              {ex.sets.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {ex.sets.map((s, i) => (
                    <li key={s.id}>
                      <SetRow
                        index={i}
                        set={s}
                        revalidatePathValue={revalidatePathValue}
                        updateAction={updateSet}
                        deleteAction={deleteSet}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-400">Sin series registradas.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

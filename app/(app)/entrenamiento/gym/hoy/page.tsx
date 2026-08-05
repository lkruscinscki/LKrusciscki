import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { BackLink } from "../../../back-link";
import { MUSCLE_GROUP_LABELS } from "../muscle-groups";
import { addSet, finalizeWorkout } from "../actions";
import { AddSetForm } from "../add-set-form";

export default async function GymHoyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: workout } = await supabase
    .from("gym_workouts")
    .select("id, completed_at")
    .eq("game_date", today)
    .maybeSingle();

  type ExerciseRow = {
    id: string;
    name: string;
    muscleGroup: string;
    sets: { id: string; reps: number; weight_kg: number }[];
  };

  let exercises: ExerciseRow[] = [];

  if (workout) {
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

    exercises = (workoutExercises ?? []).map((we) => ({
      id: we.id,
      name: we.gym_exercises?.name ?? "",
      muscleGroup: we.gym_exercises
        ? MUSCLE_GROUP_LABELS[we.gym_exercises.muscle_group]
        : "",
      sets: (sets ?? []).filter((s) => s.workout_exercise_id === we.id),
    }));
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym" />
      <h1 className="text-2xl font-semibold">Entrenamiento de hoy</h1>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Todavía no agregaste ejercicios. Elegí un grupo muscular para empezar.
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

              {ex.sets.length > 0 && (
                <ul className="mb-3 flex flex-col gap-1 text-sm">
                  {ex.sets.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex justify-between text-zinc-500 dark:text-zinc-400"
                    >
                      <span>Serie {i + 1}</span>
                      <span>
                        {s.reps} reps × {s.weight_kg} kg
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <AddSetForm workoutExerciseId={ex.id} action={addSet} />
            </section>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Link
          href="/entrenamiento/gym/grupos"
          className="btn-secondary text-center"
        >
          Agregar otro ejercicio
        </Link>

        {exercises.length > 0 && workout && (
          <form action={finalizeWorkout}>
            <input type="hidden" name="workout_id" value={workout.id} />
            <button type="submit" className="btn-primary w-full">
              Finalizar entrenamiento
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

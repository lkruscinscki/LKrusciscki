import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { BackLink } from "../../../back-link";
import { MUSCLE_GROUP_LABELS } from "../muscle-groups";
import { addSet, deleteSet, finalizeWorkout, updateSet } from "../actions";
import { AddSetForm } from "../add-set-form";
import { SetRow } from "../set-row";

const REVALIDATE_PATH = "/entrenamiento/gym/hoy";

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
    exerciseId: string;
    name: string;
    muscleGroup: string;
    sets: { id: string; reps: number; weight_kg: number }[];
  };

  let exercises: ExerciseRow[] = [];
  const lastPastSetByExercise = new Map<string, { reps: number; weight_kg: number }>();

  if (workout) {
    const { data: workoutExercises } = await supabase
      .from("gym_workout_exercises")
      .select("id, exercise_id, gym_exercises(name, muscle_group)")
      .eq("workout_id", workout.id)
      .order("created_at");

    const weIds = (workoutExercises ?? []).map((we) => we.id);
    const exerciseIds = (workoutExercises ?? []).map((we) => we.exercise_id);

    const { data: sets } =
      weIds.length > 0
        ? await supabase
            .from("gym_workout_sets")
            .select("id, workout_exercise_id, reps, weight_kg")
            .in("workout_exercise_id", weIds)
            .order("created_at")
        : { data: [] };

    // Last set logged for each of these exercises in a *different* (past)
    // workout, used to prefill/hint the "add set" inputs below.
    const { data: pastWorkoutExercises } =
      exerciseIds.length > 0
        ? await supabase
            .from("gym_workout_exercises")
            .select("id, exercise_id")
            .in("exercise_id", exerciseIds)
            .neq("workout_id", workout.id)
        : { data: [] };

    const pastWeIds = (pastWorkoutExercises ?? []).map((we) => we.id);
    const pastWeToExercise = new Map(
      (pastWorkoutExercises ?? []).map((we) => [we.id, we.exercise_id]),
    );

    const { data: pastSets } =
      pastWeIds.length > 0
        ? await supabase
            .from("gym_workout_sets")
            .select("workout_exercise_id, reps, weight_kg, created_at")
            .in("workout_exercise_id", pastWeIds)
            .order("created_at", { ascending: false })
        : { data: [] };

    for (const s of pastSets ?? []) {
      const exerciseId = pastWeToExercise.get(s.workout_exercise_id);
      if (exerciseId && !lastPastSetByExercise.has(exerciseId)) {
        lastPastSetByExercise.set(exerciseId, { reps: s.reps, weight_kg: s.weight_kg });
      }
    }

    exercises = (workoutExercises ?? []).map((we) => ({
      id: we.id,
      exerciseId: we.exercise_id,
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
          {exercises.map((ex) => {
            const lastToday = ex.sets[ex.sets.length - 1];
            const lastPast = lastPastSetByExercise.get(ex.exerciseId);
            const prefill = lastToday
              ? { reps: lastToday.reps, weightKg: lastToday.weight_kg, isPlaceholder: false }
              : lastPast
                ? { reps: lastPast.reps, weightKg: lastPast.weight_kg, isPlaceholder: true }
                : null;

            return (
              <section key={ex.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-medium">{ex.name}</h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {ex.muscleGroup}
                  </span>
                </div>

                {ex.sets.length > 0 && (
                  <ul className="mb-3 flex flex-col gap-1">
                    {ex.sets.map((s, i) => (
                      <li key={s.id}>
                        <SetRow
                          index={i}
                          set={s}
                          revalidatePathValue={REVALIDATE_PATH}
                          updateAction={updateSet}
                          deleteAction={deleteSet}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                <AddSetForm workoutExerciseId={ex.id} action={addSet} prefill={prefill} />
              </section>
            );
          })}
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

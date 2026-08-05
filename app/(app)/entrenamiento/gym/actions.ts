"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";
import { ensureTodayWorkout, ensureWorkoutExercise } from "@/lib/gym";
import { isMuscleGroup, type ExerciseType } from "./muscle-groups";

export async function createExercise(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const muscleGroup = formData.get("muscle_group") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const exerciseType = formData.get("exercise_type") as ExerciseType;

  if (!isMuscleGroup(muscleGroup) || !name || !exerciseType) return;

  await supabase.from("gym_exercises").insert({
    muscle_group: muscleGroup,
    name,
    exercise_type: exerciseType,
  });

  revalidatePath(`/entrenamiento/gym/grupos/${muscleGroup}`);
  redirect(`/entrenamiento/gym/grupos/${muscleGroup}`);
}

export async function selectExercise(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const exerciseId = formData.get("exercise_id") as string;
  if (!exerciseId) return;

  const today = await getTodayGameDate(supabase, user.id);
  const workoutId = await ensureTodayWorkout(supabase, today);
  await ensureWorkoutExercise(supabase, workoutId, exerciseId);

  revalidatePath("/entrenamiento/gym/hoy");
  revalidatePath("/entrenamiento/gym");
  redirect("/entrenamiento/gym/hoy");
}

export async function addSet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const workoutExerciseId = formData.get("workout_exercise_id") as string;
  const reps = Number(formData.get("reps"));
  const weightKg = Number(formData.get("weight_kg"));

  if (!workoutExerciseId || !reps || Number.isNaN(weightKg)) return;

  await supabase.from("gym_workout_sets").insert({
    workout_exercise_id: workoutExerciseId,
    reps,
    weight_kg: weightKg,
  });

  revalidatePath("/entrenamiento/gym/hoy");
}

export async function updateSet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const setId = formData.get("set_id") as string;
  const reps = Number(formData.get("reps"));
  const weightKg = Number(formData.get("weight_kg"));
  const revalidatePathValue =
    (formData.get("revalidate_path") as string) || "/entrenamiento/gym/hoy";

  if (!setId || !reps || Number.isNaN(weightKg)) return;

  await supabase
    .from("gym_workout_sets")
    .update({ reps, weight_kg: weightKg })
    .eq("id", setId);

  revalidatePath(revalidatePathValue);
}

export async function deleteSet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const setId = formData.get("set_id") as string;
  const revalidatePathValue =
    (formData.get("revalidate_path") as string) || "/entrenamiento/gym/hoy";
  if (!setId) return;

  await supabase.from("gym_workout_sets").delete().eq("id", setId);

  revalidatePath(revalidatePathValue);
}

export async function finalizeWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const workoutId = formData.get("workout_id") as string;
  if (!workoutId) return;

  const { data: workout } = await supabase
    .from("gym_workouts")
    .select("game_date, completed_at")
    .eq("id", workoutId)
    .single();

  if (workout && !workout.completed_at) {
    await supabase
      .from("gym_workouts")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", workoutId);

    const { data: session } = await supabase
      .from("cross_training_sessions")
      .insert({ discipline: "Gym", date: workout.game_date })
      .select("id")
      .single();

    if (session) {
      await grantXp(supabase, {
        pillar: "deportivo",
        sourceType: "cross_training_session",
        sourceId: session.id,
        baseXp: XP.deportivo.crossTrainingSession,
        gameDate: workout.game_date,
      });
    }
  }

  revalidatePath("/entrenamiento/gym/hoy");
  revalidatePath("/entrenamiento/gym/estadisticas");
  revalidatePath("/entrenamiento/gym");
  revalidatePath("/");
  redirect("/entrenamiento/gym/estadisticas");
}

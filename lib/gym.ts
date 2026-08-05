import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

type Client = SupabaseClient<Database>;

// One gym_workouts row per user per game_date acts as the running "today's
// workout" draft: created on demand the first time an exercise is added.
export async function ensureTodayWorkout(
  supabase: Client,
  gameDate: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("gym_workouts")
    .select("id")
    .eq("game_date", gameDate)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("gym_workouts")
    .insert({ game_date: gameDate })
    .select("id")
    .single();
  if (error || !created) {
    throw error ?? new Error("No se pudo crear el entrenamiento de hoy");
  }
  return created.id;
}

export async function ensureWorkoutExercise(
  supabase: Client,
  workoutId: string,
  exerciseId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("gym_workout_exercises")
    .select("id")
    .eq("workout_id", workoutId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("gym_workout_exercises")
    .insert({ workout_id: workoutId, exercise_id: exerciseId })
    .select("id")
    .single();
  if (error || !created) {
    throw error ?? new Error("No se pudo agregar el ejercicio al entrenamiento");
  }
  return created.id;
}

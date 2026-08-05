import type { Database } from "@/lib/supabase/database.types";

export type MuscleGroup = Database["public"]["Enums"]["gym_muscle_group"];
export type ExerciseType = Database["public"]["Enums"]["gym_exercise_type"];

export const MUSCLE_GROUPS: { slug: MuscleGroup; label: string }[] = [
  { slug: "pecho", label: "Pecho" },
  { slug: "hombros", label: "Hombros" },
  { slug: "espalda", label: "Espalda" },
  { slug: "biceps", label: "Bíceps" },
  { slug: "triceps", label: "Tríceps" },
  { slug: "piernas", label: "Piernas" },
  { slug: "accesorios", label: "Accesorios" },
];

export const MUSCLE_GROUP_LABELS = Object.fromEntries(
  MUSCLE_GROUPS.map((g) => [g.slug, g.label]),
) as Record<MuscleGroup, string>;

export const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: "peso_libre", label: "Peso libre" },
  { value: "polea", label: "Polea" },
  { value: "compuesto", label: "Compuesto" },
];

export const EXERCISE_TYPE_LABELS = Object.fromEntries(
  EXERCISE_TYPES.map((t) => [t.value, t.label]),
) as Record<ExerciseType, string>;

export function isMuscleGroup(value: string): value is MuscleGroup {
  return value in MUSCLE_GROUP_LABELS;
}

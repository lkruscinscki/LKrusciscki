import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../../back-link";
import { isMuscleGroup, MUSCLE_GROUP_LABELS, EXERCISE_TYPE_LABELS } from "../../muscle-groups";
import { selectExercise } from "../../actions";

export default async function MuscleGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  if (!isMuscleGroup(group)) notFound();

  const label = MUSCLE_GROUP_LABELS[group];

  const supabase = await createClient();
  const { data: exercises } = await supabase
    .from("gym_exercises")
    .select("id, name, exercise_type")
    .eq("muscle_group", group)
    .order("created_at");

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym/grupos" />
      <h1 className="text-2xl font-semibold">{label}</h1>

      {exercises && exercises.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <form action={selectExercise}>
                <input type="hidden" name="exercise_id" value={ex.id} />
                <button
                  type="submit"
                  className="card flex w-full items-center justify-between text-left"
                >
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {EXERCISE_TYPE_LABELS[ex.exercise_type]}
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">
          Todavía no agregaste ejercicios en este grupo.
        </p>
      )}

      <Link
        href={`/entrenamiento/gym/grupos/${group}/nuevo`}
        className="btn-secondary text-center"
      >
        Añadir nuevo ejercicio
      </Link>
    </div>
  );
}

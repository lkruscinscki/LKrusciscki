import { notFound } from "next/navigation";
import { BackLink } from "../../../../../back-link";
import { isMuscleGroup, MUSCLE_GROUP_LABELS, EXERCISE_TYPES } from "../../../muscle-groups";
import { createExercise } from "../../../actions";

export default async function NuevoEjercicioPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  if (!isMuscleGroup(group)) notFound();

  const label = MUSCLE_GROUP_LABELS[group];

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href={`/entrenamiento/gym/grupos/${group}`} />
      <h1 className="text-2xl font-semibold">Nuevo ejercicio · {label}</h1>

      <form action={createExercise} className="flex flex-col gap-3">
        <input type="hidden" name="muscle_group" value={group} />

        <label className="flex flex-col gap-1 text-sm">
          Nombre del ejercicio
          <input name="name" required className="input" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select name="exercise_type" required defaultValue="" className="input">
            <option value="" disabled>
              Elegir...
            </option>
            {EXERCISE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Guardar ejercicio
        </button>
      </form>
    </div>
  );
}

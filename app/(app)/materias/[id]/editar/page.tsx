import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../back-link";
import { ConfirmSubmitButton } from "../../../confirm-submit-button";
import { updateSubject, deleteSubject } from "../actions";

export default async function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: subject }, { data: quarters }] = await Promise.all([
    supabase.from("subjects").select("*").eq("id", id).maybeSingle(),
    supabase.from("quarters").select("*").order("start_date", { ascending: false }),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href={`/materias/${id}`} />
      <h1 className="text-2xl font-semibold">Editar materia</h1>

      <form action={updateSubject} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <input name="name" defaultValue={subject.name} required className="input" />
        <select name="quarter_id" defaultValue={subject.quarter_id} required className="input">
          {(quarters ?? []).map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 text-sm">
            Color
            <input
              type="color"
              name="color"
              defaultValue={subject.color}
              className="h-10 w-14 rounded border border-black/20 dark:border-white/20"
            />
          </label>
          <input
            type="number"
            name="weekly_exercise_goal"
            defaultValue={subject.weekly_exercise_goal}
            placeholder="Objetivo semanal"
            min={1}
            className="input flex-1"
          />
        </div>
        <button type="submit" className="btn-primary self-end">
          Guardar cambios
        </button>
      </form>

      <section className="card">
        <h2 className="mb-2 font-medium text-red-600 dark:text-red-400">
          Eliminar materia
        </h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Se borran también sus guías, ejercicios y sesiones de estudio. No se
          puede deshacer.
        </p>
        <form action={deleteSubject}>
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmitButton
            confirmMessage={`¿Eliminar "${subject.name}" y todo su contenido? No se puede deshacer.`}
            className="w-full rounded-lg border border-red-600 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-400 dark:text-red-400"
          >
            Eliminar materia
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}

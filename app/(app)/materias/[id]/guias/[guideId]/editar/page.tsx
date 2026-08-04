import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../../../back-link";
import { ConfirmSubmitButton } from "../../../../../confirm-submit-button";
import { updateGuide, deleteGuide } from "../../../actions";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string; guideId: string }>;
}) {
  const { id, guideId } = await params;
  const supabase = await createClient();

  const { data: guide } = await supabase
    .from("guides")
    .select("*")
    .eq("id", guideId)
    .maybeSingle();

  if (!guide) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href={`/materias/${id}`} />
      <h1 className="text-2xl font-semibold">Editar guía</h1>

      <form action={updateGuide} className="flex flex-col gap-2">
        <input type="hidden" name="guide_id" value={guide.id} />
        <input type="hidden" name="subject_id" value={id} />
        <input
          name="name"
          defaultValue={guide.name}
          required
          className="input"
        />
        <input
          type="number"
          name="total_exercises"
          defaultValue={guide.total_exercises}
          min={1}
          required
          className="input"
        />
        <button type="submit" className="btn-primary self-end">
          Guardar cambios
        </button>
      </form>

      <section className="card">
        <h2 className="mb-2 font-medium text-red-600 dark:text-red-400">
          Eliminar guía
        </h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Se borra también el progreso de ejercicios cargado para esta guía.
          No se puede deshacer.
        </p>
        <form action={deleteGuide}>
          <input type="hidden" name="guide_id" value={guide.id} />
          <input type="hidden" name="subject_id" value={id} />
          <ConfirmSubmitButton
            confirmMessage={`¿Eliminar la guía "${guide.name}"? No se puede deshacer.`}
            className="w-full rounded-lg border border-red-600 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-400 dark:text-red-400"
          >
            Eliminar guía
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}

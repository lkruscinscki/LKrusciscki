import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../../../back-link";
import { ConfirmSubmitButton } from "../../../../../confirm-submit-button";
import { updateExam, deleteExam } from "../../../actions";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>;
}) {
  const { id, examId } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .maybeSingle();

  if (!exam) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href={`/materias/${id}`} />
      <h1 className="text-2xl font-semibold">Editar parcial</h1>

      <form action={updateExam} className="flex flex-col gap-2">
        <input type="hidden" name="exam_id" value={exam.id} />
        <input type="hidden" name="subject_id" value={id} />
        <input
          name="name"
          defaultValue={exam.name}
          required
          className="input"
        />
        <input
          type="date"
          name="date"
          defaultValue={exam.date}
          required
          className="input"
        />
        <button type="submit" className="btn-primary self-end">
          Guardar cambios
        </button>
      </form>

      <section className="card">
        <h2 className="mb-2 font-medium text-red-600 dark:text-red-400">
          Eliminar parcial
        </h2>
        <form action={deleteExam}>
          <input type="hidden" name="exam_id" value={exam.id} />
          <input type="hidden" name="subject_id" value={id} />
          <ConfirmSubmitButton
            confirmMessage={`¿Eliminar "${exam.name}"? No se puede deshacer.`}
            className="w-full rounded-lg border border-red-600 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-400 dark:text-red-400"
          >
            Eliminar parcial
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}

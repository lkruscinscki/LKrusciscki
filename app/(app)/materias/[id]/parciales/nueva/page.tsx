import Link from "next/link";
import { BackLink } from "../../../../back-link";
import { addExam } from "../../actions";

export default async function NuevoParcialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href={`/materias/${id}`} />
      <h1 className="text-2xl font-semibold">Nuevo parcial</h1>

      <form action={addExam} className="flex flex-col gap-2">
        <input type="hidden" name="subject_id" value={id} />
        <input
          name="name"
          placeholder="Nombre (ej. Primer parcial)"
          required
          className="input"
        />
        <input type="date" name="date" required className="input" />
        <div className="mt-2 flex gap-2">
          <Link
            href={`/materias/${id}`}
            className="btn-secondary flex-1 text-center"
          >
            Cancelar
          </Link>
          <button type="submit" className="btn-primary flex-1">
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
}

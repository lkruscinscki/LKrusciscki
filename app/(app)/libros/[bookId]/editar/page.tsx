import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../back-link";
import { ConfirmSubmitButton } from "../../../confirm-submit-button";
import { updateBook, deleteBook } from "../../../habitos/actions";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .maybeSingle();

  if (!book) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/libros" />
      <h1 className="text-2xl font-semibold">Editar libro</h1>

      <form action={updateBook} className="flex flex-col gap-2">
        <input type="hidden" name="book_id" value={book.id} />
        <input
          name="title"
          defaultValue={book.title}
          required
          className="input"
        />
        <input
          type="number"
          name="total_pages"
          defaultValue={book.total_pages}
          min={1}
          required
          className="input"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="finished"
            value="on"
            defaultChecked={book.status === "finished"}
            className="h-4 w-4"
          />
          Completado
        </label>
        <button type="submit" className="btn-primary self-end">
          Guardar cambios
        </button>
      </form>

      <section className="card">
        <h2 className="mb-2 font-medium text-red-600 dark:text-red-400">
          Eliminar libro
        </h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Se borra también el historial de páginas leídas. No se puede
          deshacer.
        </p>
        <form action={deleteBook}>
          <input type="hidden" name="book_id" value={book.id} />
          <ConfirmSubmitButton
            confirmMessage={`¿Eliminar "${book.title}"? No se puede deshacer.`}
            className="w-full rounded-lg border border-red-600 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-400 dark:text-red-400"
          >
            Eliminar libro
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}

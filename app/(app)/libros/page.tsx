import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../back-link";
import { addBook, updateGoal } from "../habitos/actions";

export default async function LibrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: activeBooks }, { data: finishedBooks }, { data: settings }] =
    await Promise.all([
      supabase
        .from("books")
        .select("*, reading_logs(pages_read)")
        .eq("status", "reading")
        .order("created_at"),
      supabase
        .from("books")
        .select("*")
        .eq("status", "finished")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_settings")
        .select("reading_daily_goal_pages")
        .eq("user_id", user!.id)
        .single(),
    ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/habitos" />
      <h1 className="text-2xl font-semibold">Libros</h1>

      <section className="card">
        <h2 className="mb-2 font-medium">Objetivo diario</h2>
        <form action={updateGoal} className="flex gap-2">
          <input type="hidden" name="habit" value="lectura" />
          <input type="hidden" name="redirect_to" value="/libros" />
          <input
            type="number"
            name="value"
            defaultValue={settings?.reading_daily_goal_pages ?? 10}
            min={1}
            required
            className="input flex-1"
          />
          <button type="submit" className="btn-secondary">
            Guardar
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Leyendo</h2>
        {activeBooks && activeBooks.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {activeBooks.map((book) => {
              const cumulative =
                book.starting_pages +
                book.reading_logs.reduce((sum, l) => sum + l.pages_read, 0);
              return (
                <li key={book.id}>
                  <Link
                    href={`/libros/${book.id}/editar`}
                    className="card flex items-center justify-between"
                  >
                    <span className="font-medium">{book.title}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {cumulative}/{book.total_pages}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">No hay libros en curso.</p>
        )}
      </section>

      <details className="card">
        <summary className="cursor-pointer font-medium">
          Agregar libros
        </summary>
        <form action={addBook} className="mt-3 flex flex-col gap-2">
          <input name="title" placeholder="Título" required className="input" />
          <input
            type="number"
            name="total_pages"
            placeholder="Cantidad de páginas"
            min={1}
            required
            className="input"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="already_started"
              value="on"
              className="h-4 w-4"
            />
            Ya lo empecé
          </label>
          <input
            type="number"
            name="current_page"
            placeholder="¿Por qué página vas? (si ya lo empezaste)"
            min={0}
            className="input"
          />
          <button type="submit" className="btn-primary self-end">
            Agregar
          </button>
        </form>
      </details>

      {finishedBooks && finishedBooks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Completados</h2>
          <ul className="flex flex-col gap-2">
            {finishedBooks.map((book) => (
              <li key={book.id}>
                <Link
                  href={`/libros/${book.id}/editar`}
                  className="card flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400"
                >
                  <span>{book.title}</span>
                  <span>{book.total_pages} pág.</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

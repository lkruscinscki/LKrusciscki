"use client";

import { useState } from "react";

export function BookCard({
  book,
  action,
}: {
  book: { id: string; title: string; totalPages: number; cumulative: number };
  action: (formData: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);

  async function handleSave(formData: FormData) {
    await action(formData);
    setExpanded(false);
  }

  return (
    <li className="card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="font-medium">{book.title}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {book.cumulative}/{book.totalPages}
        </span>
      </button>

      {expanded && (
        <form action={handleSave} className="mt-3 flex gap-2">
          <input type="hidden" name="book_id" value={book.id} />
          <input
            type="number"
            name="up_to_page"
            defaultValue={book.cumulative || ""}
            placeholder="¿Hasta qué página llegaste?"
            min={1}
            required
            className="input flex-1"
          />
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </form>
      )}
    </li>
  );
}

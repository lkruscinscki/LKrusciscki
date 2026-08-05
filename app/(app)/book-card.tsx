"use client";

import { useState } from "react";

export function BookCard({
  book,
  todayPages,
  action,
}: {
  book: { id: string; title: string; totalPages: number; cumulative: number };
  todayPages: number;
  action: (formData: FormData) => void;
}) {
  const [expanded, setExpanded] = useState(false);

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
        <form action={action} className="mt-3 flex gap-2">
          <input type="hidden" name="book_id" value={book.id} />
          <input
            type="number"
            name="pages_today"
            defaultValue={todayPages || ""}
            placeholder="¿Cuántas páginas leíste hoy?"
            min={1}
            required
            className="input flex-1"
          />
          <button
            type="submit"
            className="btn-primary"
            onClick={() => setExpanded(false)}
          >
            Guardar
          </button>
        </form>
      )}
    </li>
  );
}

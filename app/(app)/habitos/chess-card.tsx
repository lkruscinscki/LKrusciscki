"use client";

import Link from "next/link";
import { useState } from "react";

export function ChessCard({
  weeklyMinutes,
  goalMinutes,
  action,
}: {
  weeklyMinutes: number;
  goalMinutes: number;
  action: (formData: FormData) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        <span>Ajedrez</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          {weeklyMinutes}/{goalMinutes} min semanales
        </span>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <form action={action} className="flex gap-2">
            <input
              type="number"
              name="duration_minutes"
              placeholder="¿Cuántos minutos jugaste hoy?"
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
          <Link
            href="/habitos/objetivos/ajedrez"
            className="text-sm text-accent"
          >
            Modificar objetivos
          </Link>
        </div>
      )}
    </div>
  );
}

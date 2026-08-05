"use client";

import Link from "next/link";
import { useState } from "react";

export function StretchingCard({
  weeklyMinutes,
  goalMinutes,
  action,
}: {
  weeklyMinutes: number;
  goalMinutes: number;
  action: (formData: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);

  async function handleSave(formData: FormData) {
    await action(formData);
    setExpanded(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        <span>Stretching</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          {weeklyMinutes}/{goalMinutes} min semanales
        </span>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <form action={handleSave} className="flex gap-2">
            <input
              type="number"
              name="duration_minutes"
              placeholder="¿Cuántos minutos elongaste hoy?"
              min={1}
              required
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">
              Guardar
            </button>
          </form>
          <Link
            href="/habitos/objetivos/stretching"
            className="text-sm text-accent"
          >
            Modificar objetivos
          </Link>
        </div>
      )}
    </div>
  );
}

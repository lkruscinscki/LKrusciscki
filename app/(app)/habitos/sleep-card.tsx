"use client";

import Link from "next/link";
import { useState } from "react";

export function SleepCard({
  hoursToday,
  goalHours,
  action,
}: {
  hoursToday: number;
  goalHours: number;
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
        <span>Sueño</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          {hoursToday}/{goalHours}h
        </span>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <form action={action} className="flex gap-2">
            <input
              type="number"
              name="hours"
              step={0.1}
              min={0}
              max={24}
              defaultValue={hoursToday || ""}
              placeholder="Horas dormidas"
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
          <p className="text-xs text-zinc-400">
            Carga manual por ahora — más adelante lo conectamos con tu
            wearable.
          </p>
          <Link href="/habitos/objetivos/sueno" className="text-sm text-accent">
            Modificar objetivos
          </Link>
        </div>
      )}
    </div>
  );
}

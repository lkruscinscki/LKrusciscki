"use client";

import Link from "next/link";
import { useState } from "react";

export function WaterCard({
  bottlesToday,
  goalLiters,
  incrementAction,
  decrementAction,
}: {
  bottlesToday: number;
  goalLiters: number;
  incrementAction: () => void;
  decrementAction: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const litersToday = (bottlesToday * 750) / 1000;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        <span>Agua</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          {litersToday.toFixed(2)}/{goalLiters} litros
        </span>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <form action={decrementAction}>
              <button
                type="submit"
                className="btn-secondary h-11 w-11 !p-0 text-lg"
              >
                −
              </button>
            </form>
            <div className="text-center">
              <span className="text-2xl font-semibold">{bottlesToday}</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                botellas (750ml)
              </p>
            </div>
            <form action={incrementAction}>
              <button
                type="submit"
                className="btn-primary h-11 w-11 !p-0 text-lg"
              >
                +
              </button>
            </form>
          </div>
          <Link href="/habitos/objetivos/agua" className="text-sm text-accent">
            Modificar objetivo
          </Link>
        </div>
      )}
    </div>
  );
}

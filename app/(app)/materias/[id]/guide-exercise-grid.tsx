"use client";

import Link from "next/link";
import { useState } from "react";

export function GuideCard({
  guide,
  subjectId,
  editHref,
  action,
}: {
  guide: {
    id: string;
    name: string;
    total_exercises: number;
    completed_exercises: number;
    completed_at: string | null;
  };
  subjectId: string;
  editHref: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState<boolean[]>(() =>
    Array.from(
      { length: guide.total_exercises },
      (_, i) => i < guide.completed_exercises,
    ),
  );

  const completedCount = done.filter(Boolean).length;

  async function handleSave(formData: FormData) {
    await action(formData);
    setExpanded(false);
  }

  return (
    <li className="card">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <span className="font-medium">
            {guide.name}
            {guide.completed_at ? " ✓" : ""}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {guide.completed_exercises}/{guide.total_exercises}
          </span>
        </button>
        <Link href={editHref} className="text-sm text-accent">
          editar
        </Link>
      </div>

      {expanded && (
        <form action={handleSave} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="guide_id" value={guide.id} />
          <input type="hidden" name="subject_id" value={subjectId} />
          <input
            type="hidden"
            name="completed_exercises"
            value={completedCount}
          />

          <div className="grid grid-cols-5 gap-2">
            {done.map((isDone, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                }
                className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-medium ${
                  isDone
                    ? "border-accent bg-accent text-white"
                    : "border-black/20 dark:border-white/20"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </button>
            ))}
          </div>

          <button type="submit" className="btn-primary self-end">
            Guardar
          </button>
        </form>
      )}
    </li>
  );
}

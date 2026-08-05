"use client";

import { useState } from "react";

export function GuideExerciseGrid({
  guideId,
  subjectId,
  totalExercises,
  completedExercises,
  action,
}: {
  guideId: string;
  subjectId: string;
  totalExercises: number;
  completedExercises: number;
  action: (formData: FormData) => void;
}) {
  const [done, setDone] = useState<boolean[]>(() =>
    Array.from({ length: totalExercises }, (_, i) => i < completedExercises),
  );

  const completedCount = done.filter(Boolean).length;

  return (
    <form action={action} className="mt-2 flex flex-col gap-3">
      <input type="hidden" name="guide_id" value={guideId} />
      <input type="hidden" name="subject_id" value={subjectId} />
      <input type="hidden" name="completed_exercises" value={completedCount} />

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
  );
}

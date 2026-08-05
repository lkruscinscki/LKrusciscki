"use client";

import { useState } from "react";

export function AddSetForm({
  workoutExerciseId,
  action,
}: {
  workoutExerciseId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);

  async function handleSave(formData: FormData) {
    await action(formData);
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-sm text-accent"
      >
        + Agregar serie
      </button>
    );
  }

  return (
    <form action={handleSave} className="flex items-end gap-2">
      <input type="hidden" name="workout_exercise_id" value={workoutExerciseId} />
      <label className="flex flex-1 flex-col gap-1 text-xs">
        Reps
        <input type="number" name="reps" min={1} required className="input" />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs">
        Kg
        <input
          type="number"
          name="weight_kg"
          min={0}
          step="0.5"
          required
          className="input"
        />
      </label>
      <button type="submit" className="btn-primary">
        Guardar
      </button>
    </form>
  );
}

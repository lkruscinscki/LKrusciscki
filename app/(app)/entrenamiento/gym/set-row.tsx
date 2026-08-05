"use client";

import { useState } from "react";
import { ConfirmSubmitButton } from "../../confirm-submit-button";

export function SetRow({
  index,
  set,
  revalidatePathValue,
  updateAction,
  deleteAction,
}: {
  index: number;
  set: { id: string; reps: number; weight_kg: number };
  revalidatePathValue: string;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  async function handleUpdate(formData: FormData) {
    await updateAction(formData);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center justify-between text-left text-sm text-zinc-500 dark:text-zinc-400"
      >
        <span>Serie {index + 1}</span>
        <span>
          {set.reps} reps × {set.weight_kg} kg
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-black/5 p-2 dark:bg-white/5">
      <form action={handleUpdate} className="flex items-end gap-2">
        <input type="hidden" name="set_id" value={set.id} />
        <input type="hidden" name="revalidate_path" value={revalidatePathValue} />
        <label className="flex flex-1 flex-col gap-1 text-xs">
          Reps
          <input
            type="number"
            name="reps"
            min={1}
            required
            defaultValue={set.reps}
            className="input"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs">
          Kg
          <input
            type="number"
            name="weight_kg"
            min={0}
            step="0.5"
            required
            defaultValue={set.weight_kg}
            className="input"
          />
        </label>
        <button type="submit" className="btn-primary">
          Guardar
        </button>
      </form>
      <form action={deleteAction} className="flex justify-end">
        <input type="hidden" name="set_id" value={set.id} />
        <input type="hidden" name="revalidate_path" value={revalidatePathValue} />
        <ConfirmSubmitButton
          confirmMessage="¿Eliminar esta serie? No se puede deshacer."
          className="text-sm text-red-600 dark:text-red-400"
        >
          Eliminar serie
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}

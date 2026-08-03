import { addJiujitsuSession } from "./actions";

export default function NuevoEntrenamientoPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Nuevo entrenamiento</h1>

      <form action={addJiujitsuSession} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Duración (min)
          <input
            type="number"
            name="duration_minutes"
            min={1}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Rondas de sparring
          <input
            type="number"
            name="sparring_rounds"
            min={0}
            defaultValue={0}
            className="input"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Sumisiones logradas
            <input
              type="number"
              name="submissions_achieved"
              min={0}
              defaultValue={0}
              className="input"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Sumisiones recibidas
            <input
              type="number"
              name="submissions_received"
              min={0}
              defaultValue={0}
              className="input"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Técnicas nuevas
          <input name="new_techniques" placeholder="Opcional" className="input" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notas
          <textarea
            name="notes"
            rows={4}
            placeholder="¿Cómo estuvo la sesión?"
            className="input"
          />
        </label>

        <button type="submit" className="btn-primary">
          Guardar sesión
        </button>
      </form>
    </div>
  );
}

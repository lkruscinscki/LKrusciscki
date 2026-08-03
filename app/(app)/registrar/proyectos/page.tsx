import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { addProject, updateProjectStatus, addProjectLog } from "./actions";

export default async function ProyectosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const loggableProjects = (projects ?? []).filter(
    (p) => p.status !== "finished",
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Proyectos</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Tus proyectos</h2>

        {projects && projects.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="rounded border border-black/10 p-3 dark:border-white/10"
              >
                <span className="font-medium">{p.name}</span>
                {p.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {p.description}
                  </p>
                )}
                <form
                  action={updateProjectStatus}
                  className="mt-2 flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <select
                    name="status"
                    defaultValue={p.status}
                    className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
                  >
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="finished">Terminado</option>
                  </select>
                  <button type="submit" className="text-sm underline">
                    actualizar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">
            Todavía no creaste ningún proyecto.
          </p>
        )}

        <form
          action={addProject}
          className="flex flex-col gap-2 border-t border-black/10 pt-3 dark:border-white/10"
        >
          <input
            name="name"
            placeholder="Nombre del proyecto"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <input
            name="description"
            placeholder="Descripción (opcional)"
            className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            className="self-end rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Crear proyecto
          </button>
        </form>
      </section>

      {loggableProjects.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <h2 className="font-medium">Nueva entrada de log</h2>
          <form action={addProjectLog} className="flex flex-col gap-2">
            <select
              name="project_id"
              required
              defaultValue=""
              className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            >
              <option value="" disabled>
                Elegí un proyecto
              </option>
              {loggableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              defaultValue={today}
              required
              className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <textarea
              name="notes"
              placeholder="¿Qué avanzaste?"
              required
              rows={3}
              className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <input
              type="number"
              name="hours"
              placeholder="Horas (opcional)"
              min={0}
              step={0.5}
              className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <button
              type="submit"
              className="self-end rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Guardar entrada
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

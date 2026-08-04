import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { BackLink } from "../../back-link";
import { addQuarter, updateQuarter, addSubject } from "../actions";

export default async function ManageQuarterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: quarters } = await supabase
    .from("quarters")
    .select("*")
    .order("start_date", { ascending: false });

  const activeQuarter = (quarters ?? []).find(
    (q) => q.start_date <= today && today <= q.end_date,
  );

  const { data: quarterSubjects } = activeQuarter
    ? await supabase
        .from("subjects")
        .select("*")
        .eq("quarter_id", activeQuarter.id)
        .order("name")
    : { data: null };

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/materias" />
      <h1 className="text-2xl font-semibold">Modificar cuatrimestre</h1>

      {activeQuarter ? (
        <section className="card">
          <h2 className="mb-2 font-medium">Cuatrimestre actual</h2>
          <form action={updateQuarter} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={activeQuarter.id} />
            <input
              name="name"
              defaultValue={activeQuarter.name}
              required
              className="input"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="start_date"
                defaultValue={activeQuarter.start_date}
                required
                className="input flex-1"
              />
              <input
                type="date"
                name="end_date"
                defaultValue={activeQuarter.end_date}
                required
                className="input flex-1"
              />
            </div>
            <button type="submit" className="btn-primary self-end">
              Guardar
            </button>
          </form>
        </section>
      ) : (
        <section className="card">
          <h2 className="mb-2 font-medium">No hay un cuatrimestre vigente</h2>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Creá uno para poder agregar materias.
          </p>
          <form action={addQuarter} className="flex flex-col gap-2">
            <input
              name="name"
              placeholder="Nombre (ej. 2026-2)"
              required
              className="input"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="start_date"
                required
                className="input flex-1"
              />
              <input
                type="date"
                name="end_date"
                required
                className="input flex-1"
              />
            </div>
            <button type="submit" className="btn-primary self-end">
              Crear cuatrimestre
            </button>
          </form>
        </section>
      )}

      {activeQuarter && (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Materias de este cuatrimestre</h2>
          {quarterSubjects && quarterSubjects.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {quarterSubjects.map((s) => (
                <li key={s.id} className="card flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1">{s.name}</span>
                  <Link
                    href={`/materias/${s.id}/editar`}
                    className="text-sm text-accent"
                  >
                    editar
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">
              Todavía no hay materias en este cuatrimestre.
            </p>
          )}

          <form
            action={addSubject}
            className="card flex flex-col gap-2 text-sm"
          >
            <input type="hidden" name="quarter_id" value={activeQuarter.id} />
            <input name="name" placeholder="Nombre" required className="input" />
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2">
                Color
                <input
                  type="color"
                  name="color"
                  defaultValue="#ea580c"
                  className="h-10 w-14 rounded border border-black/20 dark:border-white/20"
                />
              </label>
              <input
                type="number"
                name="weekly_exercise_goal"
                placeholder="Objetivo semanal"
                min={1}
                defaultValue={10}
                className="input flex-1"
              />
            </div>
            <button type="submit" className="btn-secondary self-end">
              Agregar materia
            </button>
          </form>
        </section>
      )}

      {quarters && quarters.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-medium">Todos los cuatrimestres</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {quarters.map((q) => (
              <li key={q.id} className="flex justify-between">
                <span>{q.name}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {q.start_date} — {q.end_date}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

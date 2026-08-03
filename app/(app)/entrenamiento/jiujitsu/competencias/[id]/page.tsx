import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, daysBetween } from "@/lib/game-day";
import { addMatch } from "../actions";

const RESULT_LABELS: Record<string, string> = {
  win: "Victoria",
  loss: "Derrota",
  draw: "Empate",
};

const METHOD_LABELS: Record<string, string> = {
  submission: "Sumisión",
  points: "Puntos",
  decision: "Decisión",
  dq: "Descalificación",
  other: "Otro",
};

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!competition) {
    notFound();
  }

  const { data: matches } = await supabase
    .from("competition_matches")
    .select("*")
    .eq("competition_id", id)
    .order("match_order");

  const canLogMatches = competition.date <= today;
  const daysUntil = !canLogMatches
    ? daysBetween(today, competition.date)
    : null;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{competition.event_name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {competition.date}
          {competition.category ? ` · ${competition.category}` : ""}
        </p>
      </div>

      {!canLogMatches ? (
        <div className="card text-sm text-zinc-500 dark:text-zinc-400">
          <p className="font-medium text-accent">
            Faltan {daysUntil} día{daysUntil === 1 ? "" : "s"}
          </p>
          <p>Vas a poder cargar los combates a partir del {competition.date}.</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {(matches ?? []).map((m) => (
              <li key={m.id} className="card text-sm">
                <span className="font-medium">
                  Combate {m.match_order} · {RESULT_LABELS[m.result]} por{" "}
                  {METHOD_LABELS[m.method]}
                </span>
                {m.score && (
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Marcador: {m.score}
                  </p>
                )}
                {m.notes && (
                  <p className="text-zinc-500 dark:text-zinc-400">{m.notes}</p>
                )}
              </li>
            ))}
            {(!matches || matches.length === 0) && (
              <p className="text-sm text-zinc-400">
                Todavía no cargaste combates.
              </p>
            )}
          </ul>

          <form
            action={addMatch}
            className="flex flex-col gap-2 border-t border-black/10 pt-4 dark:border-white/10"
          >
            <h2 className="font-medium">Agregar combate</h2>
            <input type="hidden" name="competition_id" value={competition.id} />
            <select name="result" required defaultValue="" className="input">
              <option value="" disabled>
                Resultado
              </option>
              <option value="win">Victoria</option>
              <option value="loss">Derrota</option>
              <option value="draw">Empate</option>
            </select>
            <select name="method" required defaultValue="" className="input">
              <option value="" disabled>
                Método
              </option>
              <option value="submission">Sumisión</option>
              <option value="points">Puntos</option>
              <option value="decision">Decisión</option>
              <option value="dq">Descalificación</option>
              <option value="other">Otro</option>
            </select>
            <input
              name="score"
              placeholder="Marcador (opcional, ej. 10-2)"
              className="input"
            />
            <textarea
              name="notes"
              placeholder="Notas (opcional)"
              rows={2}
              className="input"
            />
            <button type="submit" className="btn-primary self-end">
              Agregar combate
            </button>
          </form>
        </>
      )}
    </div>
  );
}

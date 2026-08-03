import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, daysBetween } from "@/lib/game-day";

export default async function JiujitsuHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: nextCompetitions } = await supabase
    .from("competitions")
    .select("*")
    .gte("date", today)
    .order("date")
    .limit(1);

  const nextCompetition = nextCompetitions?.[0];
  const daysUntil = nextCompetition
    ? daysBetween(today, nextCompetition.date)
    : null;

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-semibold">Jiujitsu</h1>

      <Link
        href="/entrenamiento/jiujitsu/nuevo"
        className="card flex items-center gap-3"
      >
        <span className="text-2xl">🥋</span>
        <div>
          <p className="font-medium">Nuevo entrenamiento</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Cargar la sesión de hoy
          </p>
        </div>
      </Link>

      <Link
        href="/entrenamiento/jiujitsu/competencias"
        className="card flex items-center gap-3"
      >
        <span className="text-2xl">🏆</span>
        <div>
          <p className="font-medium">Próximo torneo</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {nextCompetition
              ? `${nextCompetition.event_name} · ${
                  daysUntil === 0 ? "hoy" : `faltan ${daysUntil}d`
                }`
              : "Agregar y ver competencias"}
          </p>
        </div>
      </Link>

      <Link
        href="/entrenamiento/jiujitsu/estadisticas"
        className="card flex items-center gap-3"
      >
        <span className="text-2xl">📊</span>
        <div>
          <p className="font-medium">Estadísticas y notas</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Historial completo de sesiones
          </p>
        </div>
      </Link>
    </div>
  );
}

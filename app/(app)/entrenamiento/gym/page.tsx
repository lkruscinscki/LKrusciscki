import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";

export default async function GymHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = await getTodayGameDate(supabase, user!.id);

  const { data: workout } = await supabase
    .from("gym_workouts")
    .select("id, completed_at")
    .eq("game_date", today)
    .maybeSingle();

  const inProgress = Boolean(workout && !workout.completed_at);

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-semibold">Gym</h1>

      <Link
        href={inProgress ? "/entrenamiento/gym/hoy" : "/entrenamiento/gym/grupos"}
        className="card flex items-center gap-3"
      >
        <span className="text-2xl">🏋️</span>
        <div>
          <p className="font-medium">
            {inProgress ? "Continuar entrenamiento" : "Nuevo entrenamiento"}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {inProgress
              ? "Seguí con la sesión de hoy"
              : "Elegir grupo muscular y cargar series"}
          </p>
        </div>
      </Link>

      <Link
        href="/entrenamiento/gym/estadisticas"
        className="card flex items-center gap-3"
      >
        <span className="text-2xl">📊</span>
        <div>
          <p className="font-medium">Estadísticas</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Progreso por grupo muscular y ejercicio
          </p>
        </div>
      </Link>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../back-link";

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function GymHistorialPage() {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("gym_workouts")
    .select("id, game_date, gym_workout_exercises(id)")
    .not("completed_at", "is", null)
    .order("game_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym" />
      <h1 className="text-2xl font-semibold">Entrenamientos pasados</h1>

      {workouts && workouts.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {workouts.map((w) => {
            const exerciseCount = w.gym_workout_exercises?.length ?? 0;
            return (
              <li key={w.id}>
                <Link
                  href={`/entrenamiento/gym/historial/${w.id}`}
                  className="card flex items-center justify-between"
                >
                  <span className="font-medium capitalize">
                    {formatDateLabel(w.game_date)}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {exerciseCount} ejercicio{exerciseCount === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">
          Todavía no completaste ningún entrenamiento.
        </p>
      )}
    </div>
  );
}

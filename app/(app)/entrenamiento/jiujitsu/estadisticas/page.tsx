import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { getMonthlyJiujitsuSubmissions } from "@/lib/stats";
import { StatTile } from "../../../stat-tile";
import { BackLink } from "../../../back-link";
import { SubmissionsChart } from "../submissions-chart";

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export default async function JiujitsuEstadisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);

  const [{ data: sessions }, monthlySubmissions] = await Promise.all([
    supabase.from("jiujitsu_sessions").select("*").order("date", { ascending: false }),
    getMonthlyJiujitsuSubmissions(supabase, today),
  ]);

  const all = sessions ?? [];

  const totalSessions = all.length;
  const totalHours = all.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;
  const totalAchieved = all.reduce((sum, s) => sum + s.submissions_achieved, 0);
  const totalReceived = all.reduce((sum, s) => sum + s.submissions_received, 0);
  const ratio =
    totalReceived > 0
      ? (totalAchieved / totalReceived).toFixed(2)
      : totalAchieved > 0
        ? "∞"
        : "—";

  const submissionsChartData = monthlySubmissions.map((r) => ({
    monthLabel: formatMonthLabel(r.month),
    achieved: r.achieved,
    received: r.received,
  }));
  const hasSubmissionsData = monthlySubmissions.some(
    (r) => r.achieved > 0 || r.received > 0,
  );

  const sessionsWithNotes = all.filter(
    (s) => s.notes && s.notes.trim().length > 0,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/jiujitsu" />
      <h1 className="text-2xl font-semibold">Estadísticas y notas</h1>

      <section className="card">
        <h2 className="mb-3 font-medium">Totales</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatTile label="Sesiones" value={totalSessions} />
          <StatTile label="Horas en el tatami" value={totalHours.toFixed(1)} />
          <StatTile label="Sumisiones logradas" value={totalAchieved} />
          <StatTile label="Sumisiones recibidas" value={totalReceived} />
          <StatTile label="Ratio log./recib." value={ratio} />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">Sumisiones por mes</h2>
        {hasSubmissionsData ? (
          <SubmissionsChart data={submissionsChartData} />
        ) : (
          <p className="text-sm text-zinc-400">Todavía no hay sumisiones registradas.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Notas de sesiones</h2>
        {sessionsWithNotes.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {sessionsWithNotes.map((s) => (
              <li key={s.id} className="card">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {s.date} · {s.duration_minutes} min · {s.submissions_achieved}{" "}
                  log. / {s.submissions_received} recib.
                </p>
                <p className="mt-1 text-sm">{s.notes}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">
            Todavía no dejaste notas en ninguna sesión.
          </p>
        )}
      </section>
    </div>
  );
}

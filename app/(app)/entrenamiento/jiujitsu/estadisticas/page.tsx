import { createClient } from "@/lib/supabase/server";
import { getMonthLabel } from "@/lib/calendar";
import { StatTile } from "../../../stat-tile";

export default async function JiujitsuEstadisticasPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("jiujitsu_sessions")
    .select("*")
    .order("date", { ascending: false });

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

  const monthlyMap = new Map<
    string,
    { sessions: number; achieved: number; received: number }
  >();
  for (const s of all) {
    const monthKey = s.date.slice(0, 7);
    const entry = monthlyMap.get(monthKey) ?? {
      sessions: 0,
      achieved: 0,
      received: 0,
    };
    entry.sessions += 1;
    entry.achieved += s.submissions_achieved;
    entry.received += s.submissions_received;
    monthlyMap.set(monthKey, entry);
  }
  const monthlyRows = Array.from(monthlyMap.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );

  const sessionsWithNotes = all.filter(
    (s) => s.notes && s.notes.trim().length > 0,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
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

      {monthlyRows.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-medium">Mes a mes</h2>
          <div className="flex flex-col gap-2 text-sm">
            {monthlyRows.map(([month, data]) => (
              <div
                key={month}
                className="flex items-center justify-between border-b border-black/5 pb-2 last:border-0 dark:border-white/5"
              >
                <span className="font-medium">
                  {getMonthLabel(`${month}-01`)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {data.sessions} sesion{data.sessions === 1 ? "" : "es"} ·{" "}
                  {data.achieved} log. · {data.received} recib.
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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

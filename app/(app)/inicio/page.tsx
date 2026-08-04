import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { getMonthGrid, getMonthLabel, getMonthRange } from "@/lib/calendar";
import { StatTile } from "../stat-tile";
import { logout } from "@/app/login/actions";
import { getCurrentStreak, getPillarXpTotals, getXpEarnedOnDate } from "@/lib/xp";
import { getLevelFromXp } from "@/lib/game-config";
import type { Database } from "@/lib/supabase/database.types";

type Pillar = Database["public"]["Enums"]["pillar"];

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const PILLARS: { key: Pillar; label: string }[] = [
  { key: "academico", label: "Académico" },
  { key: "deportivo", label: "Deportivo" },
  { key: "profesional", label: "Profesional" },
  { key: "personal", label: "Personal" },
];

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);
  const { start: monthStart, end: monthEnd } = getMonthRange(today);

  const [
    { data: jiujitsuMonth },
    { data: crossTrainingMonth },
    { data: meditationMonth },
    { data: journalMonth },
    { data: readingMonth },
    { data: chessMonth },
    { data: sleepMonth },
    { data: waterMonth },
    { streakDays, multiplier },
    pillarTotals,
    xpToday,
  ] = await Promise.all([
    supabase
      .from("jiujitsu_sessions")
      .select("date, submissions_achieved, submissions_received")
      .gte("date", monthStart)
      .lte("date", monthEnd),
    supabase
      .from("cross_training_sessions")
      .select("date")
      .gte("date", monthStart)
      .lte("date", monthEnd),
    supabase
      .from("meditation_logs")
      .select("game_date")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    supabase
      .from("journal_entries")
      .select("game_date")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    supabase
      .from("reading_logs")
      .select("game_date, pages_read")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    supabase
      .from("chess_sessions")
      .select("game_date")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    supabase
      .from("sleep_logs")
      .select("hours")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    supabase
      .from("water_intake_logs")
      .select("bottles_count")
      .gte("game_date", monthStart)
      .lte("game_date", monthEnd),
    getCurrentStreak(supabase, today),
    getPillarXpTotals(supabase),
    getXpEarnedOnDate(supabase, today),
  ]);

  const habitDaysThisMonth = new Set<string>([
    ...(meditationMonth ?? []).map((r) => r.game_date),
    ...(journalMonth ?? []).map((r) => r.game_date),
    ...(readingMonth ?? []).map((r) => r.game_date),
    ...(chessMonth ?? []).map((r) => r.game_date),
  ]);

  const trainingDaysThisMonth = new Set<string>([
    ...(jiujitsuMonth ?? []).map((r) => r.date),
    ...(crossTrainingMonth ?? []).map((r) => r.date),
  ]);

  const grid = getMonthGrid(today);
  const monthLabel = getMonthLabel(today);

  const levels = PILLARS.map((p) => ({
    ...p,
    ...getLevelFromXp(pillarTotals[p.key]),
  }));
  const overallLevel =
    levels.reduce((sum, l) => sum + l.level, 0) / levels.length;

  const totalTrainingSessions =
    (jiujitsuMonth?.length ?? 0) + (crossTrainingMonth?.length ?? 0);
  const submissionsAchieved = (jiujitsuMonth ?? []).reduce(
    (sum, s) => sum + s.submissions_achieved,
    0,
  );
  const submissionsReceived = (jiujitsuMonth ?? []).reduce(
    (sum, s) => sum + s.submissions_received,
    0,
  );
  const pagesRead = (readingMonth ?? []).reduce(
    (sum, r) => sum + r.pages_read,
    0,
  );
  const meditationDays = meditationMonth?.length ?? 0;
  const journalingDays = journalMonth?.length ?? 0;

  const sleepHours = (sleepMonth ?? []).map((r) => r.hours);
  const avgSleep =
    sleepHours.length > 0
      ? sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length
      : null;

  const waterCounts = (waterMonth ?? []).map((r) => r.bottles_count);
  const avgWater =
    waterCounts.length > 0
      ? waterCounts.reduce((a, b) => a + b, 0) / waterCounts.length
      : null;

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Inicio</h1>

      <div className="grid grid-cols-2 gap-3">
        <section className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Racha global
          </p>
          <p className="text-3xl font-semibold text-accent">
            {streakDays}
            <span className="text-lg"> día{streakDays === 1 ? "" : "s"}</span>
          </p>
          {multiplier > 1 && (
            <p className="text-xs text-accent">×{multiplier} XP hoy</p>
          )}
        </section>

        <section className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            XP hoy
          </p>
          <p className="text-3xl font-semibold">{Math.round(xpToday)}</p>
        </section>
      </div>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Niveles</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            General · Nv. {overallLevel.toFixed(1)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {levels.map((l) => {
            const progress =
              l.xpForNextLevel > 0 ? l.xpIntoLevel / l.xpForNextLevel : 0;
            return (
              <div key={l.key} className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-lg font-semibold">Nv. {l.level}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {Math.round(l.xpIntoLevel)}/{l.xpForNextLevel} XP
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium capitalize">{monthLabel}</h2>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((d) => (
            <span key={d} className="text-xs text-zinc-400">
              {d}
            </span>
          ))}
          {grid.map((day) => {
            const isToday = day.date === today;
            const hasHabit = habitDaysThisMonth.has(day.date);
            const hasTraining = trainingDaysThisMonth.has(day.date);
            return (
              <div
                key={day.date}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${
                  day.inCurrentMonth ? "" : "opacity-25"
                } ${hasHabit ? "bg-accent/15" : ""} ${
                  isToday ? "ring-2 ring-accent" : ""
                }`}
              >
                <span>{Number(day.date.slice(8, 10))}</span>
                {hasTraining && <span className="text-[10px]">🥋</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Fondo resaltado = al menos un hábito ese día · 🥋 = entrenaste
        </p>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">Este mes</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatTile label="Sesiones de entrenamiento" value={totalTrainingSessions} />
          <StatTile label="Sumisiones logradas" value={submissionsAchieved} />
          <StatTile label="Sumisiones recibidas" value={submissionsReceived} />
          <StatTile label="Páginas leídas" value={pagesRead} />
          <StatTile label="Días de meditación" value={meditationDays} />
          <StatTile label="Días de journaling" value={journalingDays} />
          {avgSleep !== null && (
            <StatTile label="Sueño promedio" value={`${avgSleep.toFixed(1)}h`} />
          )}
          {avgWater !== null && (
            <StatTile label="Agua promedio/día" value={`${avgWater.toFixed(1)} bot.`} />
          )}
        </div>
      </section>

      <section className="card">
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          {user!.email}
        </p>
        <form action={logout}>
          <button type="submit" className="btn-secondary w-full">
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  );
}

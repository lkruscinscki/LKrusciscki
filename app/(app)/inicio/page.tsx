import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, addDays, computeStreak } from "@/lib/game-day";
import { getMonthGrid, getMonthLabel, getMonthRange } from "@/lib/calendar";

const STREAK_LOOKBACK_DAYS = 60;
const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);
  const { start: monthStart, end: monthEnd } = getMonthRange(today);
  const streakSince = addDays(today, -STREAK_LOOKBACK_DAYS);

  const [
    { data: jiujitsuMonth },
    { data: crossTrainingMonth },
    { data: meditationMonth },
    { data: journalMonth },
    { data: readingMonth },
    { data: chessMonth },
    { data: sleepMonth },
    { data: waterMonth },
    { data: meditationStreak },
    { data: journalStreak },
    { data: readingStreak },
    { data: chessStreak },
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
    supabase.from("meditation_logs").select("game_date").gte("game_date", streakSince),
    supabase.from("journal_entries").select("game_date").gte("game_date", streakSince),
    supabase.from("reading_logs").select("game_date").gte("game_date", streakSince),
    supabase.from("chess_sessions").select("game_date").gte("game_date", streakSince),
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

  const streakDays = new Set<string>([
    ...(meditationStreak ?? []).map((r) => r.game_date),
    ...(journalStreak ?? []).map((r) => r.game_date),
    ...(readingStreak ?? []).map((r) => r.game_date),
    ...(chessStreak ?? []).map((r) => r.game_date),
  ]);

  const streak = computeStreak(streakDays, today);
  const grid = getMonthGrid(today);
  const monthLabel = getMonthLabel(today);

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

      <section className="card flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Racha de hábitos
          </p>
          <p className="text-3xl font-semibold text-accent">
            {streak} día{streak === 1 ? "" : "s"}
          </p>
        </div>
        <span className="text-4xl">🔥</span>
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
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

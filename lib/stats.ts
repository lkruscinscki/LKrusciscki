import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";
import { addDays, getWeekStart } from "./game-day";
import { getMonthRange } from "./calendar";

type Pillar = Database["public"]["Enums"]["pillar"];
type Client = SupabaseClient<Database>;

const PILLARS: Pillar[] = ["academico", "deportivo", "profesional", "personal"];

function emptyTotals(): Record<Pillar, number> {
  return { academico: 0, deportivo: 0, profesional: 0, personal: 0 };
}

export type PillarComparisonRow = {
  pillar: Pillar;
  previous: number;
  current: number;
};

// Sums xp_events per pillar over two date ranges (previous vs current
// period) in a single query, for week-over-week / month-over-month charts.
async function getPillarXpComparison(
  supabase: Client,
  previousStart: string,
  previousEnd: string,
  currentStart: string,
  currentEnd: string,
): Promise<PillarComparisonRow[]> {
  const { data } = await supabase
    .from("xp_events")
    .select("pillar, game_date, final_xp")
    .gte("game_date", previousStart)
    .lte("game_date", currentEnd);

  const previous = emptyTotals();
  const current = emptyTotals();

  for (const row of data ?? []) {
    if (row.game_date >= currentStart && row.game_date <= currentEnd) {
      current[row.pillar] += row.final_xp;
    } else if (row.game_date >= previousStart && row.game_date <= previousEnd) {
      previous[row.pillar] += row.final_xp;
    }
  }

  return PILLARS.map((pillar) => ({
    pillar,
    previous: Math.round(previous[pillar]),
    current: Math.round(current[pillar]),
  }));
}

export async function getWeeklyPillarComparison(
  supabase: Client,
  today: string,
): Promise<PillarComparisonRow[]> {
  const currentStart = getWeekStart(today);
  const previousEnd = addDays(currentStart, -1);
  const previousStart = addDays(currentStart, -7);
  return getPillarXpComparison(supabase, previousStart, previousEnd, currentStart, today);
}

export async function getMonthlyPillarComparison(
  supabase: Client,
  today: string,
): Promise<PillarComparisonRow[]> {
  const { start: currentStart } = getMonthRange(today);
  const previousEnd = addDays(currentStart, -1);
  const { start: previousStart } = getMonthRange(previousEnd);
  return getPillarXpComparison(supabase, previousStart, previousEnd, currentStart, today);
}

const READING_WEEKS_BACK = 8;

export type WeeklyReadingRow = { weekStart: string; pages: number };

export async function getWeeklyReadingTrend(
  supabase: Client,
  today: string,
): Promise<WeeklyReadingRow[]> {
  const currentWeekStart = getWeekStart(today);
  const rangeStart = addDays(currentWeekStart, -7 * (READING_WEEKS_BACK - 1));

  const { data } = await supabase
    .from("reading_logs")
    .select("game_date, pages_read")
    .gte("game_date", rangeStart);

  const buckets = new Map<string, number>();
  for (let i = 0; i < READING_WEEKS_BACK; i++) {
    buckets.set(addDays(rangeStart, i * 7), 0);
  }

  for (const row of data ?? []) {
    const weekStart = getWeekStart(row.game_date);
    if (buckets.has(weekStart)) {
      buckets.set(weekStart, (buckets.get(weekStart) ?? 0) + row.pages_read);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([weekStart, pages]) => ({ weekStart, pages }));
}

const JIUJITSU_MONTHS_BACK = 6;

export type MonthlySubmissionsRow = {
  month: string; // "YYYY-MM"
  achieved: number;
  received: number;
};

export async function getMonthlyJiujitsuSubmissions(
  supabase: Client,
  today: string,
): Promise<MonthlySubmissionsRow[]> {
  const { start: currentMonthStart } = getMonthRange(today);
  const [year, month] = currentMonthStart.split("-").map(Number);
  const rangeStartDate = new Date(Date.UTC(year, month - 1 - (JIUJITSU_MONTHS_BACK - 1), 1));
  const rangeStart = rangeStartDate.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("jiujitsu_sessions")
    .select("date, submissions_achieved, submissions_received")
    .gte("date", rangeStart);

  const buckets = new Map<string, { achieved: number; received: number }>();
  for (let i = 0; i < JIUJITSU_MONTHS_BACK; i++) {
    const d = new Date(Date.UTC(year, month - 1 - (JIUJITSU_MONTHS_BACK - 1) + i, 1));
    buckets.set(d.toISOString().slice(0, 7), { achieved: 0, received: 0 });
  }

  for (const row of data ?? []) {
    const monthKey = row.date.slice(0, 7);
    const entry = buckets.get(monthKey);
    if (entry) {
      entry.achieved += row.submissions_achieved;
      entry.received += row.submissions_received;
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, totals]) => ({ month, ...totals }));
}

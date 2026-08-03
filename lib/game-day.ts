import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

// The "game day" doesn't start at midnight but at a configurable cutoff
// hour (default 4am). Something logged at 1am still counts for the
// previous day. Always computed in Buenos Aires time regardless of
// where the server actually runs (Vercel functions run in UTC).
export function getGameDate(cutoffHour: number, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (hour < cutoffHour) {
    date.setUTCDate(date.getUTCDate() - 1);
  }

  return date.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

// Monday of the week containing isoDate (missions run Monday-Sunday).
export function getWeekStart(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

export async function getUserCutoffHour(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("user_settings")
    .select("day_cutoff_hour")
    .eq("user_id", userId)
    .single();

  return data?.day_cutoff_hour ?? 4;
}

export async function getTodayGameDate(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const cutoffHour = await getUserCutoffHour(supabase, userId);
  return getGameDate(cutoffHour);
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";
import { addDays, computeStreak } from "./game-day";
import { GLOBAL_STREAK_MIN_ACTIONS, getStreakMultiplier } from "./game-config";

type Pillar = Database["public"]["Enums"]["pillar"];
type Client = SupabaseClient<Database>;

const STREAK_LOOKBACK_DAYS = 60;

// A day counts toward the global streak once it has at least
// GLOBAL_STREAK_MIN_ACTIONS xp_events, regardless of pillar. Since every
// XP-granting action writes an xp_event, this is the same "did I do
// enough today" signal the game design calls for, without having to
// union half a dozen source tables.
async function getGlobalStreakDays(
  supabase: Client,
  since: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("xp_events")
    .select("game_date")
    .gte("game_date", since);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.game_date, (counts.get(row.game_date) ?? 0) + 1);
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count >= GLOBAL_STREAK_MIN_ACTIONS)
      .map(([date]) => date),
  );
}

export async function getCurrentStreak(
  supabase: Client,
  today: string,
): Promise<{ streakDays: number; multiplier: number }> {
  const since = addDays(today, -STREAK_LOOKBACK_DAYS);
  const days = await getGlobalStreakDays(supabase, since);
  const streakDays = computeStreak(days, today);
  return { streakDays, multiplier: getStreakMultiplier(streakDays) };
}

type GrantXpParams = {
  pillar: Pillar;
  sourceType: string;
  sourceId?: string | null;
  baseXp: number;
  gameDate: string;
  // When true, updates the existing event for this (sourceType, sourceId,
  // gameDate) instead of inserting a new one — for upsert-style daily
  // habits that can be edited in place (meditation, reading, etc.).
  dedupe?: boolean;
};

export async function grantXp(
  supabase: Client,
  params: GrantXpParams,
): Promise<void> {
  if (params.baseXp <= 0) return;

  const { multiplier } = await getCurrentStreak(supabase, params.gameDate);
  const finalXp = Math.round(params.baseXp * multiplier * 100) / 100;

  if (params.dedupe) {
    let query = supabase
      .from("xp_events")
      .select("id")
      .eq("source_type", params.sourceType)
      .eq("game_date", params.gameDate);

    query = params.sourceId
      ? query.eq("source_id", params.sourceId)
      : query.is("source_id", null);

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      await supabase
        .from("xp_events")
        .update({
          base_xp: params.baseXp,
          streak_multiplier: multiplier,
          final_xp: finalXp,
        })
        .eq("id", existing.id);
      return;
    }
  }

  await supabase.from("xp_events").insert({
    pillar: params.pillar,
    source_type: params.sourceType,
    source_id: params.sourceId ?? null,
    base_xp: params.baseXp,
    streak_multiplier: multiplier,
    final_xp: finalXp,
    game_date: params.gameDate,
  });
}

export async function revokeXp(
  supabase: Client,
  params: { sourceType: string; sourceId?: string | null; gameDate: string },
): Promise<void> {
  let query = supabase
    .from("xp_events")
    .delete()
    .eq("source_type", params.sourceType)
    .eq("game_date", params.gameDate);

  query = params.sourceId
    ? query.eq("source_id", params.sourceId)
    : query.is("source_id", null);

  await query;
}

export async function getPillarXpTotals(
  supabase: Client,
): Promise<Record<Pillar, number>> {
  const { data } = await supabase.from("xp_events").select("pillar, final_xp");

  const totals: Record<Pillar, number> = {
    academico: 0,
    deportivo: 0,
    profesional: 0,
    personal: 0,
  };

  for (const row of data ?? []) {
    totals[row.pillar] += row.final_xp;
  }

  return totals;
}

export async function getXpEarnedOnDate(
  supabase: Client,
  gameDate: string,
): Promise<number> {
  const { data } = await supabase
    .from("xp_events")
    .select("final_xp")
    .eq("game_date", gameDate);

  return (data ?? []).reduce((sum, row) => sum + row.final_xp, 0);
}

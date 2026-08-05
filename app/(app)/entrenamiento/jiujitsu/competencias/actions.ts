"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

export async function addCompetition(formData: FormData) {
  const supabase = await createClient();
  const event_name = ((formData.get("event_name") as string) ?? "").trim();
  const category = ((formData.get("category") as string) ?? "").trim() || null;
  const date = formData.get("date") as string;
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!event_name || !date) return;

  const { data } = await supabase
    .from("competitions")
    .insert({ event_name, category, date, notes })
    .select("id")
    .single();

  revalidatePath("/entrenamiento/jiujitsu");
  revalidatePath("/entrenamiento/jiujitsu/competencias");

  if (data) {
    redirect(`/entrenamiento/jiujitsu/competencias/${data.id}`);
  }
}

export async function addMatch(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const competition_id = formData.get("competition_id") as string;
  const result = formData.get("result") as string;
  const method = formData.get("method") as string;
  const score = ((formData.get("score") as string) ?? "").trim() || null;
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!competition_id || !result || !method) return;

  const { count } = await supabase
    .from("competition_matches")
    .select("*", { count: "exact", head: true })
    .eq("competition_id", competition_id);

  const matchOrder = (count ?? 0) + 1;

  const { data: match } = await supabase
    .from("competition_matches")
    .insert({
      competition_id,
      match_order: matchOrder,
      result: result as "win" | "loss" | "draw",
      method: method as "submission" | "points" | "decision" | "dq" | "other",
      score,
      notes,
    })
    .select("id")
    .single();

  if (match) {
    const today = await getTodayGameDate(supabase, user.id);
    const baseXp =
      XP.deportivo.competitionMatch +
      (matchOrder === 1 ? XP.deportivo.competitionBonus : 0);

    await grantXp(supabase, {
      pillar: "deportivo",
      sourceType: "competition_match",
      sourceId: match.id,
      baseXp,
      gameDate: today,
    });
  }

  revalidatePath(`/entrenamiento/jiujitsu/competencias/${competition_id}`);
  revalidatePath("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  revalidatePath("/registrar/competencias");

  if (data) {
    redirect(`/registrar/competencias/${data.id}`);
  }
}

export async function addMatch(formData: FormData) {
  const supabase = await createClient();
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

  await supabase.from("competition_matches").insert({
    competition_id,
    match_order: (count ?? 0) + 1,
    result: result as "win" | "loss" | "draw",
    method: method as "submission" | "points" | "decision" | "dq" | "other",
    score,
    notes,
  });

  revalidatePath(`/registrar/competencias/${competition_id}`);
}

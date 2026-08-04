"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

export async function addCrossTrainingSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const discipline = ((formData.get("discipline") as string) ?? "").trim();
  const slug = ((formData.get("slug") as string) ?? "").trim();
  const date = formData.get("date") as string;
  const duration_minutes = Number(formData.get("duration_minutes"));
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!discipline || !date || !duration_minutes) return;

  const { data: session } = await supabase
    .from("cross_training_sessions")
    .insert({ discipline, date, duration_minutes, notes })
    .select("id")
    .single();

  if (session) {
    const today = await getTodayGameDate(supabase, user.id);
    await grantXp(supabase, {
      pillar: "deportivo",
      sourceType: "cross_training_session",
      sourceId: session.id,
      baseXp: XP.deportivo.crossTrainingSession,
      gameDate: today,
    });
  }

  revalidatePath(`/entrenamiento/${slug}`);
  revalidatePath("/inicio");
}

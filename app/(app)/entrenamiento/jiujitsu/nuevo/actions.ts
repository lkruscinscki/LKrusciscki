"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";

export async function addJiujitsuSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const date = await getTodayGameDate(supabase, user.id);
  const duration_minutes = Number(formData.get("duration_minutes"));
  const sparring_rounds = Number(formData.get("sparring_rounds") || 0);
  const submissions_achieved = Number(
    formData.get("submissions_achieved") || 0,
  );
  const submissions_received = Number(
    formData.get("submissions_received") || 0,
  );
  const new_techniques =
    ((formData.get("new_techniques") as string) ?? "").trim() || null;
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!duration_minutes) return;

  await supabase.from("jiujitsu_sessions").insert({
    date,
    type: "no_gi",
    duration_minutes,
    sparring_rounds,
    submissions_achieved,
    submissions_received,
    new_techniques,
    notes,
  });

  revalidatePath("/entrenamiento/jiujitsu/nuevo");
  revalidatePath("/entrenamiento/jiujitsu/estadisticas");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addCrossTrainingSession(formData: FormData) {
  const supabase = await createClient();
  const discipline = ((formData.get("discipline") as string) ?? "").trim();
  const slug = ((formData.get("slug") as string) ?? "").trim();
  const date = formData.get("date") as string;
  const duration_minutes = Number(formData.get("duration_minutes"));
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!discipline || !date || !duration_minutes) return;

  await supabase.from("cross_training_sessions").insert({
    discipline,
    date,
    duration_minutes,
    notes,
  });

  revalidatePath(`/entrenamiento/${slug}`);
}

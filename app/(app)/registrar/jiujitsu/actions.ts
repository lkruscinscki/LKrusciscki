"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addJiujitsuSession(formData: FormData) {
  const supabase = await createClient();

  const date = formData.get("date") as string;
  const type = formData.get("type") as string;
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

  if (!date || !type || !duration_minutes) return;

  await supabase.from("jiujitsu_sessions").insert({
    date,
    type: type as "gi" | "no_gi" | "open_mat",
    duration_minutes,
    sparring_rounds,
    submissions_achieved,
    submissions_received,
    new_techniques,
    notes,
  });

  revalidatePath("/registrar/jiujitsu");
}

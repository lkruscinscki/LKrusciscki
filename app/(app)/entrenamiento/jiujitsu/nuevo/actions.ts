"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

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

  const { data: session } = await supabase
    .from("jiujitsu_sessions")
    .insert({
      date,
      type: "no_gi",
      duration_minutes,
      sparring_rounds,
      submissions_achieved,
      submissions_received,
      new_techniques,
      notes,
    })
    .select("id")
    .single();

  if (session) {
    const baseXp =
      XP.deportivo.jiujitsuSession +
      submissions_achieved * XP.deportivo.submissionAchieved +
      submissions_received * XP.deportivo.submissionReceived +
      (notes ? XP.deportivo.sessionNotesBonus : 0);

    await grantXp(supabase, {
      pillar: "deportivo",
      sourceType: "jiujitsu_session",
      sourceId: session.id,
      baseXp,
      gameDate: date,
    });
  }

  revalidatePath("/entrenamiento/jiujitsu/nuevo");
  revalidatePath("/entrenamiento/jiujitsu/estadisticas");
  revalidatePath("/");
}

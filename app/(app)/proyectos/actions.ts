"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string) ?? "").trim();
  const description =
    ((formData.get("description") as string) ?? "").trim() || null;

  if (!name) return;

  await supabase.from("projects").insert({ name, description });

  revalidatePath("/proyectos");
}

export async function updateProjectStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase
    .from("projects")
    .update({ status: status as "active" | "paused" | "finished" })
    .eq("id", id);

  revalidatePath("/proyectos");
}

export async function addProjectLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const project_id = formData.get("project_id") as string;
  const date = formData.get("date") as string;
  const notes = ((formData.get("notes") as string) ?? "").trim();
  const hoursRaw = formData.get("hours");
  const hours = hoursRaw ? Number(hoursRaw) : null;

  if (!project_id || !date || !notes) return;

  await supabase.from("project_logs").insert({ project_id, date, notes, hours });

  const today = await getTodayGameDate(supabase, user.id);
  await grantXp(supabase, {
    pillar: "profesional",
    sourceType: "project_log",
    sourceId: project_id,
    baseXp: XP.profesional.projectLogEntry,
    gameDate: today,
    dedupe: true,
  });

  revalidatePath("/proyectos");
  revalidatePath("/");
}

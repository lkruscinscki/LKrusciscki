"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string) ?? "").trim();
  const description =
    ((formData.get("description") as string) ?? "").trim() || null;

  if (!name) return;

  await supabase.from("projects").insert({ name, description });

  revalidatePath("/registrar/proyectos");
}

export async function updateProjectStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase
    .from("projects")
    .update({ status: status as "active" | "paused" | "finished" })
    .eq("id", id);

  revalidatePath("/registrar/proyectos");
}

export async function addProjectLog(formData: FormData) {
  const supabase = await createClient();
  const project_id = formData.get("project_id") as string;
  const date = formData.get("date") as string;
  const notes = ((formData.get("notes") as string) ?? "").trim();
  const hoursRaw = formData.get("hours");
  const hours = hoursRaw ? Number(hoursRaw) : null;

  if (!project_id || !date || !notes) return;

  await supabase.from("project_logs").insert({ project_id, date, notes, hours });

  revalidatePath("/registrar/proyectos");
}

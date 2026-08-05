"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addQuarter(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string) ?? "").trim();
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;

  if (!name || !start_date || !end_date) return;

  await supabase.from("quarters").insert({ name, start_date, end_date });

  revalidatePath("/materias");
  revalidatePath("/materias/cuatrimestre");
}

export async function updateQuarter(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;

  if (!id || !name || !start_date || !end_date) return;

  await supabase
    .from("quarters")
    .update({ name, start_date, end_date })
    .eq("id", id);

  revalidatePath("/materias");
  revalidatePath("/materias/cuatrimestre");
}

export async function addSubject(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string) ?? "").trim();
  const color = (formData.get("color") as string) || "#ea580c";
  const quarter_id = formData.get("quarter_id") as string;
  const weeklyGoalRaw = formData.get("weekly_exercise_goal");
  const weekly_exercise_goal = weeklyGoalRaw ? Number(weeklyGoalRaw) : 10;

  if (!name || !quarter_id) return;

  await supabase.from("subjects").insert({
    name,
    color,
    quarter_id,
    weekly_exercise_goal,
  });

  revalidatePath("/materias");
  revalidatePath("/");
}

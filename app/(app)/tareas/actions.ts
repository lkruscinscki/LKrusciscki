"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTodo(formData: FormData) {
  const supabase = await createClient();
  const text = ((formData.get("text") as string) ?? "").trim();
  const for_date = formData.get("for_date") as string;

  if (!text || !for_date) return;

  await supabase.from("todos").insert({ text, for_date });

  revalidatePath("/tareas");
}

export async function toggleTodo(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const wasCompleted = formData.get("completed") === "true";

  await supabase
    .from("todos")
    .update({
      completed: !wasCompleted,
      completed_at: !wasCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/tareas");
}

export async function deleteTodo(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("todos").delete().eq("id", id);

  revalidatePath("/tareas");
}

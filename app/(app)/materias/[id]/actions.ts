"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

export async function updateSubject(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const color = (formData.get("color") as string) || "#ea580c";
  const quarter_id = formData.get("quarter_id") as string;
  const weeklyGoalRaw = formData.get("weekly_exercise_goal");
  const weekly_exercise_goal = weeklyGoalRaw ? Number(weeklyGoalRaw) : 10;

  if (!id || !name || !quarter_id) return;

  await supabase
    .from("subjects")
    .update({ name, color, quarter_id, weekly_exercise_goal })
    .eq("id", id);

  revalidatePath(`/materias/${id}`);
  revalidatePath("/materias");
  revalidatePath("/inicio");
  redirect(`/materias/${id}`);
}

export async function deleteSubject(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return;

  await supabase.from("subjects").delete().eq("id", id);

  revalidatePath("/materias");
  revalidatePath("/inicio");
  redirect("/materias");
}

export async function addExam(formData: FormData) {
  const supabase = await createClient();
  const subject_id = formData.get("subject_id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const date = formData.get("date") as string;

  if (!subject_id || !name || !date) return;

  await supabase.from("exams").insert({ subject_id, name, date });

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/inicio");
}

export async function addGuide(formData: FormData) {
  const supabase = await createClient();
  const subject_id = formData.get("subject_id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const totalRaw = formData.get("total_exercises");
  const total_exercises = totalRaw ? Number(totalRaw) : 0;
  const target_date = (formData.get("target_date") as string) || null;

  if (!subject_id || !name || total_exercises <= 0) return;

  await supabase.from("guides").insert({
    subject_id,
    name,
    total_exercises,
    target_date,
  });

  revalidatePath(`/materias/${subject_id}`);
}

export async function markExercisesResolved(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const guide_id = formData.get("guide_id") as string;
  const subject_id = formData.get("subject_id") as string;
  const exercisesRaw = formData.get("exercises_added");
  const requestedExercises = exercisesRaw ? Number(exercisesRaw) : 0;

  if (!guide_id || !subject_id || requestedExercises <= 0) return;

  const { data: guide } = await supabase
    .from("guides")
    .select("completed_exercises, total_exercises, completed_at")
    .eq("id", guide_id)
    .single();

  if (!guide) return;

  const remaining = guide.total_exercises - guide.completed_exercises;
  const exercisesAdded = Math.min(requestedExercises, remaining);
  if (exercisesAdded <= 0) return;

  const newCompleted = guide.completed_exercises + exercisesAdded;
  const justCompleted = !guide.completed_at && newCompleted >= guide.total_exercises;
  const today = await getTodayGameDate(supabase, user.id);

  await supabase
    .from("guides")
    .update({
      completed_exercises: newCompleted,
      completed_at: justCompleted ? new Date().toISOString() : guide.completed_at,
    })
    .eq("id", guide_id);

  const { data: log } = await supabase
    .from("exercise_progress_logs")
    .insert({
      guide_id,
      subject_id,
      exercises_added: exercisesAdded,
      game_date: today,
    })
    .select("id")
    .single();

  if (log) {
    await grantXp(supabase, {
      pillar: "academico",
      sourceType: "exercise_resolved",
      sourceId: log.id,
      baseXp: exercisesAdded * XP.academico.exerciseResolved,
      gameDate: today,
    });
  }

  if (justCompleted) {
    await grantXp(supabase, {
      pillar: "academico",
      sourceType: "guide_completed",
      sourceId: guide_id,
      baseXp: XP.academico.guideCompleted,
      gameDate: today,
    });
  }

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/materias");
  revalidatePath("/inicio");
}

export async function addStudySession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const subject_id = formData.get("subject_id") as string;
  const guide_id = (formData.get("guide_id") as string) || null;
  const duration_minutes = Number(formData.get("duration_minutes"));
  const topic = ((formData.get("topic") as string) ?? "").trim() || null;
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!subject_id || !duration_minutes) return;

  const today = await getTodayGameDate(supabase, user.id);

  const { data: session } = await supabase
    .from("study_sessions")
    .insert({
      subject_id,
      guide_id,
      duration_minutes,
      topic,
      notes,
      date: today,
    })
    .select("id")
    .single();

  if (session && duration_minutes >= XP.academico.studySessionMinMinutes) {
    const extraMinutes = duration_minutes - XP.academico.studySessionMinMinutes;
    const bonus =
      Math.floor(extraMinutes / 10) * XP.academico.studySessionPerExtra10Min;
    const baseXp = Math.min(
      XP.academico.studySessionBase + bonus,
      XP.academico.studySessionCap,
    );

    await grantXp(supabase, {
      pillar: "academico",
      sourceType: "study_session",
      sourceId: session.id,
      baseXp,
      gameDate: today,
    });
  }

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/inicio");
}

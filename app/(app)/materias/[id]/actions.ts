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
  revalidatePath("/");
  redirect(`/materias/${id}`);
}

export async function deleteSubject(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return;

  await supabase.from("subjects").delete().eq("id", id);

  revalidatePath("/materias");
  revalidatePath("/");
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
  revalidatePath("/");
  redirect(`/materias/${subject_id}`);
}

export async function updateExam(formData: FormData) {
  const supabase = await createClient();
  const exam_id = formData.get("exam_id") as string;
  const subject_id = formData.get("subject_id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const date = formData.get("date") as string;

  if (!exam_id || !subject_id || !name || !date) return;

  await supabase.from("exams").update({ name, date }).eq("id", exam_id);

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/");
  redirect(`/materias/${subject_id}`);
}

export async function deleteExam(formData: FormData) {
  const supabase = await createClient();
  const exam_id = formData.get("exam_id") as string;
  const subject_id = formData.get("subject_id") as string;
  if (!exam_id || !subject_id) return;

  await supabase.from("exams").delete().eq("id", exam_id);

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/");
  redirect(`/materias/${subject_id}`);
}

export async function addGuide(formData: FormData) {
  const supabase = await createClient();
  const subject_id = formData.get("subject_id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const totalRaw = formData.get("total_exercises");
  const total_exercises = totalRaw ? Number(totalRaw) : 0;

  if (!subject_id || !name || total_exercises <= 0) return;

  await supabase.from("guides").insert({
    subject_id,
    name,
    total_exercises,
  });

  revalidatePath(`/materias/${subject_id}`);
  redirect(`/materias/${subject_id}`);
}

export async function updateGuide(formData: FormData) {
  const supabase = await createClient();
  const guide_id = formData.get("guide_id") as string;
  const subject_id = formData.get("subject_id") as string;
  const name = ((formData.get("name") as string) ?? "").trim();
  const totalRaw = formData.get("total_exercises");
  const total_exercises = totalRaw ? Number(totalRaw) : 0;

  if (!guide_id || !subject_id || !name || total_exercises <= 0) return;

  await supabase
    .from("guides")
    .update({ name, total_exercises })
    .eq("id", guide_id);

  revalidatePath(`/materias/${subject_id}`);
  redirect(`/materias/${subject_id}`);
}

export async function deleteGuide(formData: FormData) {
  const supabase = await createClient();
  const guide_id = formData.get("guide_id") as string;
  const subject_id = formData.get("subject_id") as string;
  if (!guide_id || !subject_id) return;

  await supabase.from("guides").delete().eq("id", guide_id);

  revalidatePath(`/materias/${subject_id}`);
  redirect(`/materias/${subject_id}`);
}

export async function saveGuideProgress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const guide_id = formData.get("guide_id") as string;
  const subject_id = formData.get("subject_id") as string;
  const requestedRaw = formData.get("completed_exercises");
  const requestedCompleted = requestedRaw ? Number(requestedRaw) : 0;

  if (!guide_id || !subject_id) return;

  const { data: guide } = await supabase
    .from("guides")
    .select("completed_exercises, total_exercises, completed_at")
    .eq("id", guide_id)
    .single();

  if (!guide) return;

  const clampedCompleted = Math.min(
    Math.max(requestedCompleted, 0),
    guide.total_exercises,
  );
  const delta = clampedCompleted - guide.completed_exercises;
  const isNowComplete = clampedCompleted >= guide.total_exercises;
  const today = await getTodayGameDate(supabase, user.id);

  await supabase
    .from("guides")
    .update({
      completed_exercises: clampedCompleted,
      completed_at: isNowComplete
        ? (guide.completed_at ?? new Date().toISOString())
        : null,
    })
    .eq("id", guide_id);

  if (delta > 0) {
    const { data: log } = await supabase
      .from("exercise_progress_logs")
      .insert({
        guide_id,
        subject_id,
        exercises_added: delta,
        game_date: today,
      })
      .select("id")
      .single();

    if (log) {
      await grantXp(supabase, {
        pillar: "academico",
        sourceType: "exercise_resolved",
        sourceId: log.id,
        baseXp: delta * XP.academico.exerciseResolved,
        gameDate: today,
      });
    }
  }

  if (isNowComplete && !guide.completed_at) {
    const { data: existingBonus } = await supabase
      .from("xp_events")
      .select("id")
      .eq("source_type", "guide_completed")
      .eq("source_id", guide_id)
      .maybeSingle();

    if (!existingBonus) {
      await grantXp(supabase, {
        pillar: "academico",
        sourceType: "guide_completed",
        sourceId: guide_id,
        baseXp: XP.academico.guideCompleted,
        gameDate: today,
      });
    }
  }

  revalidatePath(`/materias/${subject_id}`);
  revalidatePath("/materias");
  revalidatePath("/");
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
  revalidatePath("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export async function logMeditation(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const durationRaw = formData.get("duration_minutes");
  const duration_minutes = durationRaw ? Number(durationRaw) : null;

  await supabase
    .from("meditation_logs")
    .upsert(
      { game_date: gameDate, duration_minutes },
      { onConflict: "user_id,game_date" },
    );

  revalidatePath("/");
}

export async function undoMeditation() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  await supabase.from("meditation_logs").delete().eq("game_date", gameDate);

  revalidatePath("/");
}

export async function saveJournalEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const content = ((formData.get("content") as string) ?? "").trim();

  if (!content) return;

  await supabase
    .from("journal_entries")
    .upsert(
      { game_date: gameDate, content },
      { onConflict: "user_id,game_date" },
    );

  revalidatePath("/");
}

export async function saveReadingLog(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const pagesRaw = formData.get("pages_read");
  const pages_read = pagesRaw ? Number(pagesRaw) : 0;
  const bookTitle = ((formData.get("book_title") as string) ?? "").trim();

  if (!pages_read || pages_read <= 0) return;

  let book_id: string | null = null;

  if (bookTitle) {
    const { data: existing } = await supabase
      .from("books")
      .select("id")
      .ilike("title", bookTitle)
      .maybeSingle();

    if (existing) {
      book_id = existing.id;
    } else {
      const { data: created } = await supabase
        .from("books")
        .insert({ title: bookTitle })
        .select("id")
        .single();
      book_id = created?.id ?? null;
    }
  }

  await supabase
    .from("reading_logs")
    .upsert(
      { game_date: gameDate, pages_read, book_id },
      { onConflict: "user_id,game_date" },
    );

  revalidatePath("/");
}

export async function saveCreativeBlock(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const activity = ((formData.get("activity") as string) ?? "").trim();
  const durationRaw = formData.get("duration_minutes");
  const duration_minutes = durationRaw ? Number(durationRaw) : 0;
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!activity || duration_minutes <= 0) return;

  await supabase.from("creative_blocks").insert({
    activity,
    duration_minutes,
    notes,
    date: gameDate,
  });

  revalidatePath("/");
}

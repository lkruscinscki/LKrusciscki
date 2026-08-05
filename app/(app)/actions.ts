"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import { grantXp, revokeXp } from "@/lib/xp";
import { XP } from "@/lib/game-config";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

function computeReadingXp(pagesRead: number): number {
  if (pagesRead < XP.personal.readingMinPages) return 0;
  const extraPages = pagesRead - XP.personal.readingMinPages;
  const bonus = Math.floor(extraPages / 5) * XP.personal.readingPerExtra5Pages;
  return Math.min(XP.personal.readingBase + bonus, XP.personal.readingCap);
}

export async function logMeditation() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  await supabase
    .from("meditation_logs")
    .upsert(
      { game_date: gameDate, duration_minutes: null },
      { onConflict: "user_id,game_date" },
    );

  await grantXp(supabase, {
    pillar: "personal",
    sourceType: "meditation",
    baseXp: XP.personal.meditation,
    gameDate,
    dedupe: true,
  });

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function logJournaling() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  await supabase
    .from("journal_entries")
    .upsert(
      { game_date: gameDate, content: null },
      { onConflict: "user_id,game_date" },
    );

  await grantXp(supabase, {
    pillar: "personal",
    sourceType: "journaling",
    baseXp: XP.personal.journaling,
    gameDate,
    dedupe: true,
  });

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function addBook(formData: FormData) {
  const { supabase } = await requireUser();
  const title = ((formData.get("title") as string) ?? "").trim();
  const totalPagesRaw = formData.get("total_pages");
  const total_pages = totalPagesRaw ? Number(totalPagesRaw) : 0;

  if (!title || total_pages <= 0) return;

  await supabase.from("books").insert({ title, total_pages });

  revalidatePath("/");
}

export async function saveReadingLog(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const pagesRaw = formData.get("pages_read");
  const pages_read = pagesRaw ? Number(pagesRaw) : 0;
  const book_id = formData.get("book_id") as string;

  if (!book_id || !pages_read || pages_read <= 0) return;

  await supabase
    .from("reading_logs")
    .upsert(
      { game_date: gameDate, pages_read, book_id },
      { onConflict: "user_id,game_date" },
    );

  const { data: book } = await supabase
    .from("books")
    .select("total_pages, reading_logs(pages_read)")
    .eq("id", book_id)
    .single();

  if (book) {
    const totalRead = book.reading_logs.reduce(
      (sum, log) => sum + log.pages_read,
      0,
    );
    if (totalRead >= book.total_pages) {
      await supabase
        .from("books")
        .update({ status: "finished" })
        .eq("id", book_id);
    }
  }

  const readingXp = computeReadingXp(pages_read);
  if (readingXp > 0) {
    await grantXp(supabase, {
      pillar: "personal",
      sourceType: "reading",
      baseXp: readingXp,
      gameDate,
      dedupe: true,
    });
  } else {
    await revokeXp(supabase, { sourceType: "reading", gameDate });
  }

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function saveCreativeBlock(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const activity = ((formData.get("activity") as string) ?? "").trim();
  const durationRaw = formData.get("duration_minutes");
  const duration_minutes = durationRaw ? Number(durationRaw) : 0;

  if (!activity || duration_minutes <= 0) return;

  const { data: block } = await supabase
    .from("creative_blocks")
    .insert({ activity, duration_minutes, date: gameDate })
    .select("id")
    .single();

  if (block && duration_minutes >= XP.personal.creativeBlockMinMinutes) {
    await grantXp(supabase, {
      pillar: "personal",
      sourceType: "creative_block",
      sourceId: block.id,
      baseXp: XP.personal.creativeBlock,
      gameDate,
    });
  }

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function logChess() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  await supabase
    .from("chess_sessions")
    .upsert({ game_date: gameDate }, { onConflict: "user_id,game_date" });

  await grantXp(supabase, {
    pillar: "personal",
    sourceType: "chess",
    baseXp: XP.personal.chess,
    gameDate,
    dedupe: true,
  });

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function undoChess() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  await supabase.from("chess_sessions").delete().eq("game_date", gameDate);
  await revokeXp(supabase, { sourceType: "chess", gameDate });

  revalidatePath("/");
  revalidatePath("/inicio");
}

export async function incrementWater() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  const { data: existing } = await supabase
    .from("water_intake_logs")
    .select("bottles_count")
    .eq("game_date", gameDate)
    .maybeSingle();

  const bottles_count = (existing?.bottles_count ?? 0) + 1;

  await supabase
    .from("water_intake_logs")
    .upsert(
      { game_date: gameDate, bottles_count },
      { onConflict: "user_id,game_date" },
    );

  revalidatePath("/");
}

export async function decrementWater() {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);

  const { data: existing } = await supabase
    .from("water_intake_logs")
    .select("bottles_count")
    .eq("game_date", gameDate)
    .maybeSingle();

  const bottles_count = Math.max(0, (existing?.bottles_count ?? 0) - 1);

  await supabase
    .from("water_intake_logs")
    .upsert(
      { game_date: gameDate, bottles_count },
      { onConflict: "user_id,game_date" },
    );

  revalidatePath("/");
}

export async function saveSleep(formData: FormData) {
  const { supabase, user } = await requireUser();
  const gameDate = await getTodayGameDate(supabase, user.id);
  const hoursRaw = formData.get("hours");
  const hours = hoursRaw ? Number(hoursRaw) : null;

  if (hours === null || hours < 0) return;

  await supabase
    .from("sleep_logs")
    .upsert({ game_date: gameDate, hours }, { onConflict: "user_id,game_date" });

  if (hours > 0) {
    await grantXp(supabase, {
      pillar: "personal",
      sourceType: "sleep",
      baseXp: XP.personal.sleep,
      gameDate,
      dedupe: true,
    });
  } else {
    await revokeXp(supabase, { sourceType: "sleep", gameDate });
  }

  revalidatePath("/");
  revalidatePath("/inicio");
}

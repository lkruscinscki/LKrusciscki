import type { Database } from "@/lib/supabase/database.types";

type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];

export const GOAL_CONFIGS: Record<
  string,
  {
    label: string;
    column: keyof UserSettingsRow;
    unit: string;
    step?: number;
    defaultValue: number;
  }
> = {
  stretching: {
    label: "stretching",
    column: "stretching_weekly_goal_minutes",
    unit: "Minutos por semana",
    defaultValue: 20,
  },
  creativo: {
    label: "bloque creativo",
    column: "creative_block_weekly_goal_minutes",
    unit: "Minutos por semana",
    defaultValue: 120,
  },
  ajedrez: {
    label: "ajedrez",
    column: "chess_weekly_goal_minutes",
    unit: "Minutos por semana",
    defaultValue: 60,
  },
  sueno: {
    label: "sueño",
    column: "sleep_daily_goal_hours",
    unit: "Horas por día",
    step: 0.5,
    defaultValue: 8,
  },
  agua: {
    label: "agua",
    column: "water_daily_goal_liters",
    unit: "Litros por día",
    step: 0.25,
    defaultValue: 3,
  },
  lectura: {
    label: "lectura",
    column: "reading_daily_goal_pages",
    unit: "Páginas por día",
    defaultValue: 10,
  },
};

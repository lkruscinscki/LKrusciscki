import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../back-link";
import { updateStretchingGoal } from "../actions";

export default async function StretchingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("stretching_weekly_goal_minutes")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/habitos" />
      <h1 className="text-2xl font-semibold">Objetivo de stretching</h1>

      <form action={updateStretchingGoal} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          Minutos semanales
          <input
            type="number"
            name="goal_minutes"
            defaultValue={settings?.stretching_weekly_goal_minutes ?? 20}
            min={1}
            required
            className="input"
          />
        </label>
        <button type="submit" className="btn-primary self-end">
          Guardar
        </button>
      </form>
    </div>
  );
}

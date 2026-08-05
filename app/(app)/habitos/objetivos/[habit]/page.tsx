import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "../../../back-link";
import { updateGoal } from "../../actions";
import { GOAL_CONFIGS } from "../../goal-configs";

export default async function HabitGoalPage({
  params,
}: {
  params: Promise<{ habit: string }>;
}) {
  const { habit } = await params;
  const config = GOAL_CONFIGS[habit];

  if (!config) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const currentValue = settings ? settings[config.column] : config.defaultValue;

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/habitos" />
      <h1 className="text-2xl font-semibold">Objetivo de {config.label}</h1>

      <form action={updateGoal} className="flex flex-col gap-2">
        <input type="hidden" name="habit" value={habit} />
        <label className="flex flex-col gap-1 text-sm">
          {config.unit}
          <input
            type="number"
            name="value"
            defaultValue={currentValue}
            min={config.step ?? 1}
            step={config.step ?? 1}
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

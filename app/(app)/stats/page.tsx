import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate } from "@/lib/game-day";
import {
  getMonthlyJiujitsuSubmissions,
  getMonthlyPillarComparison,
  getWeeklyPillarComparison,
  getWeeklyReadingTrend,
} from "@/lib/stats";
import type { Database } from "@/lib/supabase/database.types";
import { BackLink } from "../back-link";
import { StatTile } from "../stat-tile";
import { PillarComparisonChart } from "../pillar-comparison-chart";
import { ReadingTrendChart } from "../reading-trend-chart";
import { SubmissionsChart } from "../entrenamiento/jiujitsu/submissions-chart";

type Pillar = Database["public"]["Enums"]["pillar"];

const PILLAR_LABELS: Record<Pillar, string> = {
  academico: "Académico",
  deportivo: "Deportivo",
  profesional: "Profesional",
  personal: "Personal",
};

function formatWeekLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function formatDelta(current: number, previous: number): { text: string; positive: boolean } {
  const diff = current - previous;
  const sign = diff > 0 ? "+" : "";
  return { text: `${sign}${diff} XP vs. anterior`, positive: diff > 0 };
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);

  const [weeklyPillar, monthlyPillar, weeklyReading, monthlySubmissions] = await Promise.all([
    getWeeklyPillarComparison(supabase, today),
    getMonthlyPillarComparison(supabase, today),
    getWeeklyReadingTrend(supabase, today),
    getMonthlyJiujitsuSubmissions(supabase, today),
  ]);

  const weeklyTotal = weeklyPillar.reduce(
    (acc, r) => ({ previous: acc.previous + r.previous, current: acc.current + r.current }),
    { previous: 0, current: 0 },
  );
  const monthlyTotal = monthlyPillar.reduce(
    (acc, r) => ({ previous: acc.previous + r.previous, current: acc.current + r.current }),
    { previous: 0, current: 0 },
  );

  const weeklyChartData = weeklyPillar.map((r) => ({
    label: PILLAR_LABELS[r.pillar],
    previous: r.previous,
    current: r.current,
  }));
  const monthlyChartData = monthlyPillar.map((r) => ({
    label: PILLAR_LABELS[r.pillar],
    previous: r.previous,
    current: r.current,
  }));
  const readingChartData = weeklyReading.map((r) => ({
    weekLabel: formatWeekLabel(r.weekStart),
    pages: r.pages,
  }));
  const submissionsChartData = monthlySubmissions.map((r) => ({
    monthLabel: formatMonthLabel(r.month),
    achieved: r.achieved,
    received: r.received,
  }));

  const totalPagesRead = weeklyReading.reduce((sum, r) => sum + r.pages, 0);
  const hasJiujitsuData = monthlySubmissions.some(
    (r) => r.achieved > 0 || r.received > 0,
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/" />
      <h1 className="text-2xl font-semibold">Estadísticas</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="XP esta semana"
          value={Math.round(weeklyTotal.current)}
          delta={formatDelta(weeklyTotal.current, weeklyTotal.previous)}
        />
        <StatTile
          label="XP este mes"
          value={Math.round(monthlyTotal.current)}
          delta={formatDelta(monthlyTotal.current, monthlyTotal.previous)}
        />
      </div>

      <section className="card">
        <h2 className="mb-1 font-medium">XP por pilar · esta semana vs. la anterior</h2>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          La semana en curso todavía no terminó.
        </p>
        <PillarComparisonChart
          data={weeklyChartData}
          previousLabel="Semana pasada"
          currentLabel="Esta semana"
        />
      </section>

      <section className="card">
        <h2 className="mb-1 font-medium">XP por pilar · este mes vs. el anterior</h2>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          El mes en curso todavía no terminó.
        </p>
        <PillarComparisonChart
          data={monthlyChartData}
          previousLabel="Mes pasado"
          currentLabel="Este mes"
        />
      </section>

      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Lectura · últimas 8 semanas</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {totalPagesRead} pág.
          </span>
        </div>
        {totalPagesRead > 0 ? (
          <ReadingTrendChart data={readingChartData} />
        ) : (
          <p className="text-sm text-zinc-400">Todavía no registraste páginas leídas.</p>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Jiujitsu · sumisiones por mes</h2>
        {hasJiujitsuData ? (
          <SubmissionsChart data={submissionsChartData} />
        ) : (
          <p className="text-sm text-zinc-400">Todavía no cargaste sesiones de jiujitsu.</p>
        )}
      </section>
    </div>
  );
}

"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ReadingTrendChart({
  data,
}: {
  data: { weekLabel: string; pages: number }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)" }}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--card-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="pages"
            name="Páginas"
            stroke="var(--chart-reading-line)"
            strokeWidth={2}
            fill="var(--chart-reading-line)"
            fillOpacity={0.1}
            dot={{
              r: 4,
              fill: "var(--chart-reading-line)",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

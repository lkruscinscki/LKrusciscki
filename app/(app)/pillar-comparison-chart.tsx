"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "var(--background)",
  border: "1px solid var(--card-border)",
  borderRadius: 8,
  fontSize: 12,
};

export function PillarComparisonChart({
  data,
  previousLabel,
  currentLabel,
}: {
  data: { label: string; previous: number; current: number }[];
  previousLabel: string;
  currentLabel: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barGap={2}
          margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis
            type="number"
            tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={78}
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--chart-grid)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span style={{ color: "var(--foreground)" }}>{value}</span>
            )}
          />
          <Bar
            dataKey="previous"
            name={previousLabel}
            fill="var(--chart-period-previous)"
            radius={[0, 4, 4, 0]}
            barSize={18}
          >
            <LabelList
              dataKey="previous"
              position="right"
              style={{ fill: "var(--foreground)", fontSize: 11 }}
            />
          </Bar>
          <Bar
            dataKey="current"
            name={currentLabel}
            fill="var(--chart-period-current)"
            radius={[0, 4, 4, 0]}
            barSize={18}
          >
            <LabelList
              dataKey="current"
              position="right"
              style={{ fill: "var(--foreground)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

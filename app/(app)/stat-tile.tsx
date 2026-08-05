export function StatTile({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta?: { text: string; positive: boolean };
}) {
  return (
    <div className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      {delta && (
        <p
          className="mt-1 text-xs font-medium"
          style={{
            color: delta.positive
              ? "var(--chart-delta-good)"
              : "var(--chart-muted)",
          }}
        >
          {delta.text}
        </p>
      )}
    </div>
  );
}

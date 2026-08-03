export type CalendarDay = {
  date: string;
  inCurrentMonth: boolean;
};

export function getMonthRange(isoDate: string): { start: string; end: string } {
  const [year, month] = isoDate.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// Monday-start grid for the month containing isoDate, padded with the
// leading/trailing days needed to fill full weeks.
export function getMonthGrid(isoDate: string): CalendarDay[] {
  const [year, month] = isoDate.split("-").map(Number);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastOfMonth = new Date(Date.UTC(year, month, 0));

  const firstWeekday = firstOfMonth.getUTCDay();
  const leadingDays = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - leadingDays);

  const lastWeekday = lastOfMonth.getUTCDay();
  const trailingDays = lastWeekday === 0 ? 0 : 7 - lastWeekday;
  const end = new Date(lastOfMonth);
  end.setUTCDate(end.getUTCDate() + trailingDays);

  const days: CalendarDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push({
      date: cursor.toISOString().slice(0, 10),
      inCurrentMonth: cursor.getUTCMonth() === month - 1,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function getMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

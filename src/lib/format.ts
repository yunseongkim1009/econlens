import type { Indicator, Observation, Period } from "@/types/economics";
export function formatValue(
  value: number,
  unit: Indicator["unit"],
  compact = false,
) {
  return (
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits:
        unit === "percent" || unit === "index" ? 2 : compact ? 1 : 0,
      ...(compact ? { notation: "compact" as const } : {}),
      ...(unit === "usd" ? { style: "currency", currency: "USD" } : {}),
    }).format(value) + (unit === "percent" ? "%" : "")
  );
}
export function available(rows: Observation[]) {
  return rows.filter(
    (r): r is Observation & { value: number } => r.value !== null,
  );
}
export function inPeriod(rows: Observation[], period: Period) {
  const observed = available(rows);
  const first = observed[0]?.year;
  const last = observed.at(-1)?.year;
  if (!last) return [];
  const start =
    period === "max" ? first : Math.max(first, last - Number(period) + 1);
  const byYear = new Map(rows.map((row) => [row.year, row]));
  return Array.from({ length: last - start + 1 }, (_, i) => ({
    year: start + i,
    value: byYear.get(start + i)?.value ?? null,
    ...(byYear.get(start + i)?.status
      ? { status: byYear.get(start + i)?.status }
      : {}),
  }));
}

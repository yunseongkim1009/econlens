import type { Period, Series } from "@/types/economics";
/** Shared calendar axis, with explicit nulls for every unobserved country/year. */
export function comparisonRows(series: Record<string, Series>, period: Period) {
  const years = Object.values(series).flatMap((s) =>
    s.observations.filter((r) => r.value !== null).map((r) => r.year),
  );
  if (!years.length) return [];
  const end = Math.max(...years);
  const start =
    period === "max"
      ? Math.min(...years)
      : Math.max(Math.min(...years), end - Number(period) + 1);
  const lookup = Object.fromEntries(
    Object.entries(series).map(([code, s]) => [
      code,
      new Map(s.observations.map((r) => [r.year, r.value])),
    ]),
  );
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const year = start + i;
    const row: Record<string, number | null> = { year };
    for (const code of Object.keys(series))
      row[code] = lookup[code].get(year) ?? null;
    return row;
  });
}

/** Only compare wages when every available series uses the same verified basis. */
export function wageCompatibility(series: Record<string, Series>) {
  const available = Object.values(series).filter(
    (s) => !s.error && s.observations.some((row) => row.value !== null),
  );
  if (available.length < 2)
    return {
      compatible: false,
      reason: "At least two countries need compatible wage observations.",
      baseYear: undefined,
    };
  const bases = available.map((s) => s.wageBasis);
  if (
    bases.some(
      (b) =>
        !b ||
        !Number.isInteger(b.baseYear) ||
        b.currency !== "USD_PPP" ||
        b.priceBase !== "constant" ||
        b.frequency !== "annual" ||
        b.coverage !== "full-time equivalent employees",
    )
  )
    return {
      compatible: false,
      reason:
        "The available wage series do not share a verified currency, price basis, frequency, or employee coverage.",
      baseYear: undefined,
    };
  if (new Set(bases.map((b) => b!.baseYear)).size !== 1)
    return {
      compatible: false,
      reason:
        "Wage price-base years differ across selected countries. Choose countries with the same base year; values are not automatically rebased.",
      baseYear: undefined,
    };
  return {
    compatible: true,
    reason:
      "All available wage series share the same constant-price PPP basis.",
    baseYear: bases[0]!.baseYear,
  };
}

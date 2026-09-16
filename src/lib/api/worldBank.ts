import "server-only";
import { indicators } from "@/lib/indicators";
import type { IndicatorKey, Observation, Series } from "@/types/economics";
/** One country/indicator fits in 1,000 rows. Reject unexpected pagination rather than truncate. */
export async function getSeries(
  country: string,
  indicator: IndicatorKey,
): Promise<Series> {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicators[indicator].code}?format=json&per_page=1000&source=2`;
  const response = await fetch(url, {
    next: { revalidate: 21600 },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`World Bank returned ${response.status}`);
  const body: unknown = await response.json();
  if (
    !Array.isArray(body) ||
    body.length !== 2 ||
    !body[0] ||
    typeof body[0] !== "object"
  )
    throw new Error("Invalid World Bank response");
  const meta = body[0] as { pages?: number; lastupdated?: string };
  if (Number(meta.pages) > 1) throw new Error("Unexpected pagination");
  if (body[1] !== null && !Array.isArray(body[1]))
    throw new Error("Invalid observations");
  const observations: Observation[] = (body[1] ?? [])
    .map((row: unknown) => {
      if (!row || typeof row !== "object")
        throw new Error("Invalid observation");
      const r = row as { date?: unknown; value?: unknown };
      if (
        typeof r.date !== "string" ||
        !/^\d{4}$/.test(r.date) ||
        !(
          r.value === null ||
          (typeof r.value === "number" && Number.isFinite(r.value))
        )
      )
        throw new Error("Invalid observation");
      return { year: Number(r.date), value: r.value as number | null };
    })
    .sort((a: Observation, b: Observation) => a.year - b.year);
  return { indicator, observations, updated: meta.lastupdated ?? null };
}

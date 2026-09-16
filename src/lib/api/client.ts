import type { IndicatorKey, Series } from "@/types/economics";
const cache = new Map<string, { expires: number; series: Series }>();
const TTL = 5 * 60 * 1000;
export function invalidateSeries(country: string, indicator: IndicatorKey) {
  cache.delete(`${country}:${indicator}`);
}
export async function fetchSeries(
  country: string,
  indicator: IndicatorKey,
  signal: AbortSignal,
): Promise<Series> {
  const key = `${country}:${indicator}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    signal.throwIfAborted();
    return cached.series;
  }
  const response = await fetch(
    `/api/indicators?${new URLSearchParams({ country, indicator })}`,
    { signal },
  );
  if (!response.ok) throw new Error("Unable to load economic data.");
  const series: Series = await response.json();
  signal.throwIfAborted();
  if (!series.error) {
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { series, expires: Date.now() + TTL });
  }
  return series;
}

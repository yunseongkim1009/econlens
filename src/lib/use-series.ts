"use client";
import { useEffect, useState } from "react";
import { fetchSeries, invalidateSeries } from "@/lib/api/client";
import type { IndicatorKey, Series } from "@/types/economics";
export type SeriesRequest = { country: string; indicator: IndicatorKey };
export const requestKey = (r: SeriesRequest) => `${r.country}:${r.indicator}`;
/** Abort superseded requests; a stale response can never replace the active selection. */
export function useSeries(requests: SeriesRequest[]) {
  const signature = JSON.stringify(requests);
  const [result, setResult] = useState<{
    signature: string;
    data: Record<string, Series>;
  }>({ signature: "", data: {} });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const parsed: SeriesRequest[] = JSON.parse(signature);
    for (const request of parsed) {
      const save = (series: Series) => {
        if (!controller.signal.aborted)
          setResult((old) => ({
            signature,
            data: {
              ...(old.signature === signature ? old.data : {}),
              [requestKey(request)]: series,
            },
          }));
      };
      fetchSeries(request.country, request.indicator, controller.signal)
        .then(save)
        .catch(() =>
          save({
            indicator: request.indicator,
            observations: [],
            updated: null,
            error: "Unable to load economic data.",
          }),
        );
    }
    return () => controller.abort();
  }, [signature, attempt]);
  return {
    data: result.signature === signature ? result.data : {},
    retry: () => {
      for (const request of requests)
        invalidateSeries(request.country, request.indicator);
      setResult({ signature: "", data: {} });
      setAttempt((a) => a + 1);
    },
  };
}

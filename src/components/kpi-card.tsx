"use client";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { indicators } from "@/lib/indicators";
import { available, formatValue } from "@/lib/format";
import type { IndicatorKey, Series } from "@/types/economics";
export function KpiCard({
  indicator,
  series,
  retry,
}: {
  indicator: IndicatorKey;
  series?: Series;
  retry: () => void;
}) {
  const meta = indicators[indicator];
  const rows = available(series?.observations ?? []);
  const latest = rows.at(-1);
  const previous = rows.at(-2);
  const delta = latest && previous ? latest.value - previous.value : null;
  const Icon =
    delta === null || delta === 0
      ? Minus
      : delta > 0
        ? ArrowUpRight
        : ArrowDownRight;
  return (
    <article className="kpi">
      <h2>{meta.name}</h2>
      {!series ? (
        <div className="skeleton kpi-skeleton" aria-label="Loading indicator" />
      ) : series.error ? (
        <div className="kpi-error">
          <p>Unable to load data.</p>
          <button onClick={retry}>Retry</button>
        </div>
      ) : !latest ? (
        <p className="muted">
          {indicator === "wages" ? "Data unavailable" : "No data available"}
        </p>
      ) : (
        <>
          <div className="kpi-value">
            {formatValue(
              latest.value,
              meta.unit,
              meta.unit === "people" || indicator === "gdp",
            )}
          </div>
          <div className="kpi-change">
            <Icon size={15} />
            {delta !== null ? (
              <span>
                {delta > 0 ? "+" : ""}
                {meta.unit === "percent"
                  ? `${delta.toFixed(2)} pp`
                  : meta.unit === "index"
                    ? `${delta.toFixed(2)} index points`
                    : formatValue(delta, meta.unit, true)}{" "}
                <small>vs {previous?.year}</small>
              </span>
            ) : (
              <small>No previous observation</small>
            )}
          </div>
          <div className="kpi-date">
            Latest available: <span>{latest.year}</span>
            {meta.unit === "usd" &&
              (indicator === "wages" ? " · US$ PPP" : " · US$")}
            {meta.unit === "index" && " · 0–100"}
          </div>
        </>
      )}
    </article>
  );
}

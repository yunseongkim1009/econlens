"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, Info } from "lucide-react";
import { resolveCountry } from "@/lib/countries";
import { overviewKeys } from "@/lib/indicators";
import { useSeries, requestKey } from "@/lib/use-series";
import { KpiCard } from "./kpi-card";
import { IndicatorChart } from "./charts/indicator-chart";
import type { IndicatorKey, Period, Series } from "@/types/economics";
export function Dashboard() {
  const params = useSearchParams();
  const country = resolveCountry(params.get("country"));
  return <CountryDashboard key={country.code} country={country} />;
}
function CountryDashboard({
  country,
}: {
  country: ReturnType<typeof resolveCountry>;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const selected = params.get("period");
  const period: Period =
    selected === "5" || selected === "20" || selected === "max"
      ? selected
      : "10";
  const { data: results, retry } = useSeries(
    overviewKeys.map((indicator) => ({ country: country.code, indicator })),
  );
  const data: Partial<Record<IndicatorKey, Series>> = {};
  for (const indicator of overviewKeys) {
    const result = results[requestKey({ country: country.code, indicator })];
    if (result) data[indicator] = result;
  }
  const years = Object.values(data).flatMap((s) =>
    s.observations
      .filter((r) => r.value !== null)
      .slice(-1)
      .map((r) => r.year),
  );
  const yearsLabel = years.length
    ? `${Math.min(...years)}${Math.min(...years) !== Math.max(...years) ? `–${Math.max(...years)}` : ""}`
    : null;
  return (
    <>
      <div className="intro">
        <span className="eyebrow">COUNTRY / {country.iso3} / ANNUAL SERIES</span>
        <h1>Economic Overview</h1>
        <p>World Bank and OECD indicators, reported with their latest available observation.</p>
      </div>
      <div className="overview-context">
        <div className="country-title">
          <span className="country-flag">{country.flag}</span>
          <div>
            <h2>
              {country.name}
              <span>{country.iso3}</span>
            </h2>
            <p>
              {yearsLabel
                ? `Latest available observations: ${yearsLabel}`
                : "Annual observations · World Bank Open Data"}
            </p>
          </div>
        </div>
        <span className="data-badge">
          <Globe2 size={14} />
          World Bank data
        </span>
      </div>
      <div className="kpi-grid">
        {overviewKeys.map((key) => (
          <KpiCard key={key} indicator={key} series={data[key]} retry={retry} />
        ))}
      </div>
      <div className="section-toolbar">
        <div>
          <h2>Series history</h2>
          <p>
            Annual observations. Each series ends at its latest available year.
          </p>
        </div>
        <div
          className="period-control"
          role="group"
          aria-label="Chart time range"
        >
          {(["5", "10", "20", "max"] as Period[]).map((p) => (
            <button
              key={p}
              aria-pressed={period === p}
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                next.set("period", p);
                router.replace(`/?${next}`, { scroll: false });
              }}
            >
              {p === "max" ? "MAX" : `${p}Y`}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-grid">
        {(
          ["inflation", "growth", "unemployment", "perCapita"] as IndicatorKey[]
        ).map((key) => (
          <IndicatorChart
            key={key}
            indicator={key}
            series={data[key]}
            period={period}
            retry={retry}
          />
        ))}
      </div>
      <div className="method-note">
        <Info size={17} />
        <p>
          Read the dates, not just the numbers. Releases and coverage vary by
          indicator. Missing observations remain gaps; shorter series show only
          available history. Changes compare the two latest observations, which
          may not be consecutive years.
        </p>
      </div>
    </>
  );
}

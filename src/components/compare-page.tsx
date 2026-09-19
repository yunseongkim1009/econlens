"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { CsvDownload } from "./csv-download";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { countries } from "@/lib/countries";
import {
  indicators,
  overviewKeys,
  sourceUrl,
  unitLabel,
  sourceName,
} from "@/lib/indicators";
import { available, formatValue } from "@/lib/format";
import { comparisonRows, wageCompatibility } from "@/lib/comparison";
import { useSeries, requestKey } from "@/lib/use-series";
import { PeriodSelector, usePeriod } from "./period-selector";
import type { IndicatorKey, Series } from "@/types/economics";
const comparisonKeys: IndicatorKey[] = [...overviewKeys, "wages"];
const colors = ["#58a6ff", "#d2a8ff", "#7ee7c0", "#f2cc60", "#ffa198"];
export function ComparePage() {
  const [countryQuery, setCountryQuery] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const period = usePeriod();
  const parsed = [
    ...new Set((params.get("countries") ?? "US,KR,JP").split(",")),
  ]
    .filter((code) => countries.some((c) => c.code === code))
    .slice(0, 5);
  const codes = parsed.length >= 2 ? parsed : ["US", "KR"];
  const key = params.get("indicator");
  const indicator: IndicatorKey = comparisonKeys.includes(key as IndicatorKey)
    ? (key as IndicatorKey)
    : "perCapita";
  const { data, retry } = useSeries(
    codes.map((country) => ({ country, indicator })),
  );
  const series: Record<string, Series> = {};
  for (const code of codes) {
    const found = data[requestKey({ country: code, indicator })];
    if (found) series[code] = found;
  }
  const ready = Object.keys(series).length === codes.length;
  const wageCheck = wageCompatibility(series);
  const canCompare = indicator !== "wages" || (ready && wageCheck.compatible);
  const rows = canCompare ? comparisonRows(series, period) : [];
  const displayUnit = unitLabel(
    indicator,
    indicator === "wages" ? wageCheck.baseYear : undefined,
  );
  const meta = indicators[indicator];
  const selected = codes.map((code) => countries.find((c) => c.code === code)!);
  const visibleCountries = countries.filter((country) =>
    `${country.name} ${country.code} ${country.iso3}`
      .toLowerCase()
      .includes(countryQuery.toLowerCase()),
  );
  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(name, value);
    router.replace(`/compare?${next}`, { scroll: false });
  }
  return (
    <>
      <div className="intro">
        <span className="eyebrow">COMPARE / MULTI-COUNTRY / ANNUAL SERIES</span>
        <h1>Compare Countries</h1>
        <p>One indicator, aligned to a shared calendar with missing observations left blank.</p>
      </div>
      <section className="compare-controls">
        <label className="indicator-select">
          Indicator
          <select
            value={indicator}
            onChange={(e) => update("indicator", e.target.value)}
          >
            {comparisonKeys.map((k) => (
              <option key={k} value={k}>
                {indicators[k].name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>
            Countries{" "}
            <span className="muted">
              · Select 2–5 ({codes.length} selected)
            </span>
          </legend>
          <label className="compare-country-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search comparison countries</span>
            <input
              value={countryQuery}
              onChange={(event) => setCountryQuery(event.target.value)}
              placeholder="Search name or ISO code"
            />
          </label>
          <div className="country-chips">
            {visibleCountries.map((c) => {
              const checked = codes.includes(c.code);
              return (
                <label key={c.code} className={checked ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked ? codes.length <= 2 : codes.length >= 5}
                    onChange={() =>
                      update(
                        "countries",
                        (checked
                          ? codes.filter((code) => code !== c.code)
                          : [...codes, c.code]
                        ).join(","),
                      )
                    }
                  />
                  {c.flag} {c.name}
                  <small>{c.code}</small>
                </label>
              );
            })}
          </div>
          {!visibleCountries.length && (
            <p className="muted compare-no-countries">No countries found.</p>
          )}
        </fieldset>
      </section>
      <div className="section-toolbar">
        <div>
          <h2>{meta.name}</h2>
          <p>{meta.description}</p>
        </div>
        <PeriodSelector />
      </div>
      {indicator === "wages" && (
        <div className="coverage-note" role="status">
          <p>
            {!ready
              ? "Checking wage coverage and price bases…"
              : wageCheck.reason}{" "}
            {wageCheck.compatible && ready
              ? `${displayUnit}. Gross annual mean wages per full-time-equivalent employee, not take-home pay. Provider status flags can be inspected on each country's Wages page.`
              : ""}
          </p>
        </div>
      )}
      <section
        className="chart-card comparison-chart"
        aria-label={`${meta.name} country comparison`}
      >
        <div className="chart-header">
          <div>
            <h2>{displayUnit}</h2>
            <p>
              {rows.length
                ? `${rows[0].year}–${rows.at(-1)?.year} · Shared calendar window`
                : `Annual ${sourceName(indicator)} observations`}
            </p>
          </div>
        </div>
        <div className="comparison-legend">
          {selected.map((c, i) => (
            <span key={c.code}>
              <span
                style={{ background: colors[i] }}
                className="legend-swatch"
              />
              {c.name} ({c.code})
            </span>
          ))}
        </div>
        {!ready && (
          <p role="status" className="comparison-status">
            Loading remaining countries…
          </p>
        )}
        {!rows.length ? (
          !ready ? (
            <div className="skeleton chart-skeleton" />
          ) : (
            <div className="chart-empty">
              {indicator === "wages" && !canCompare
                ? "Wage comparison unavailable. See the coverage explanation above."
                : Object.values(series).some((s) => s.error)
                  ? "Unable to load economic data."
                  : "No data available for these countries and period."}
            </div>
          )
        ) : (
          <div className="comparison-plot">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={rows}
                margin={{ top: 15, right: 18, left: 8, bottom: 24 }}
                accessibilityLayer
              >
                <CartesianGrid
                  stroke="#28303a"
                  strokeDasharray="3 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                  tick={{ fill: "#929dab", fontSize: 12 }}
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -16,
                    fill: "#929dab",
                  }}
                />
                <YAxis
                  width={68}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929dab", fontSize: 12 }}
                  tickFormatter={(v) => formatValue(Number(v), meta.unit, true)}
                />
                <Tooltip
                  labelFormatter={(v) => `Year ${v}`}
                  formatter={(value, name) => [
                    typeof value === "number"
                      ? formatValue(value, meta.unit)
                      : "No observation",
                    String(name),
                  ]}
                  contentStyle={{
                    background: "#161b22",
                    border: "1px solid #465265",
                    borderRadius: 8,
                    color: "#e6edf3",
                  }}
                />
                {selected.map((c, i) => (
                  <Line
                    key={c.code}
                    name={c.name}
                    type="linear"
                    dataKey={c.code}
                    stroke={colors[i]}
                    strokeWidth={2}
                    strokeDasharray={i === 0 ? undefined : `${10 - i} ${i + 1}`}
                    dot={{ r: 2, strokeWidth: 0, fill: colors[i] }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="chart-footer">
          <a href={sourceUrl(indicator)} target="_blank" rel="noreferrer">
            Source: {sourceName(indicator)} ↗
          </a>
          <span>Gaps remain unfilled</span>
        </div>
      </section>
      {rows.length > 0 && (
        <div className="chart-actions">
          <CsvDownload
            filename={`econlens-comparison-${indicator}.csv`}
            rows={[
              [
                "Year",
                ...selected.map((c) => `${c.name} (${c.code})`),
                "Unit",
                "Source",
              ],
              ...rows.map((row) => [
                row.year,
                ...selected.map((c) => row[c.code] ?? null),
                displayUnit,
                sourceUrl(indicator),
              ]),
            ]}
          />
        </div>
      )}
      <section className="comparison-table">
        <h2>Latest available by country</h2>
        <p className="muted">
          Observation years may differ. Latest values can fall outside the chart
          window.
        </p>
        <div className="table-scroll">
          <table>
            <caption>
              {meta.name} · {displayUnit}
            </caption>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Latest available</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {selected.map((c, i) => {
                const s = series[c.code];
                const latest = available(s?.observations ?? []).at(-1);
                return (
                  <tr key={c.code}>
                    <th scope="row">
                      <span
                        className="legend-swatch"
                        style={{ background: colors[i] }}
                      />{" "}
                      {c.flag} {c.name} <small>{c.code}</small>
                    </th>
                    <td>{latest?.year ?? "—"}</td>
                    <td>
                      {!s ? (
                        "Loading…"
                      ) : s.error ? (
                        <>
                          <span>Unable to load data. </span>
                          <button className="text-retry" onClick={retry}>
                            Retry
                          </button>
                        </>
                      ) : indicator === "wages" && !canCompare ? (
                        "Comparison unavailable"
                      ) : latest ? (
                        formatValue(latest.value, meta.unit)
                      ) : (
                        "No data available"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {rows.length > 0 && (
        <details className="education-card">
          <summary>View comparison observations</summary>
          <div className="table-scroll">
            <table>
              <caption>
                {meta.name} · {displayUnit}
              </caption>
              <thead>
                <tr>
                  <th>Year</th>
                  {selected.map((c) => (
                    <th key={c.code}>{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.toReversed().map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    {selected.map((c) => (
                      <td key={c.code}>
                        {typeof row[c.code] === "number"
                          ? formatValue(row[c.code] as number, meta.unit)
                          : "No observation"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <div className="coverage-note">
        <p>
          The chart window ends at the latest observation across selected
          countries. Missing country-years remain blank; no values are carried
          forward.{" "}
          {indicator === "wages"
            ? "Wages use the same constant-price PPP basis across available countries. Differences in national methodology can remain. No values are converted or rebased by EconLens."
            : "Current-dollar comparisons are affected by exchange rates and are not adjusted for purchasing power. Unemployment uses modeled ILO estimates."}
        </p>
      </div>
    </>
  );
}

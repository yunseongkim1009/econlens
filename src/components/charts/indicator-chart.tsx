"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useSearchParams } from "next/navigation";
import { resolveCountry } from "@/lib/countries";
import { CsvDownload } from "../csv-download";
import { ExternalLink, ChartNoAxesCombined } from "lucide-react";
import { indicators, sourceUrl, unitLabel, sourceName } from "@/lib/indicators";
import { available, formatValue, inPeriod } from "@/lib/format";
import type { IndicatorKey, Period, Series } from "@/types/economics";
export function IndicatorChart({
  indicator,
  series,
  period,
  retry,
}: {
  indicator: IndicatorKey;
  series?: Series;
  period: Period;
  retry: () => void;
}) {
  const country = resolveCountry(useSearchParams().get("country"));
  const meta = indicators[indicator];
  const rows = inPeriod(series?.observations ?? [], period);
  const observed = available(rows);
  const latest = available(series?.observations ?? []).at(-1);
  return (
    <section className="chart-card" aria-labelledby={`chart-${indicator}`}>
      <div className="chart-header">
        <div>
          <h2 id={`chart-${indicator}`}>{meta.chartTitle}</h2>
          <p>{meta.description}</p>
        </div>
        <span className="frequency">
          {indicator === "gini" ? "SURVEY" : "ANNUAL"}
        </span>
      </div>
      {!series ? (
        <div
          className="skeleton chart-skeleton"
          role="status"
          aria-label={`Loading ${meta.name}`}
        />
      ) : series.error ? (
        <div className="chart-empty" role="status">
          <ChartNoAxesCombined />
          <p>Unable to load economic data.</p>
          <button className="retry" onClick={retry}>
            Retry
          </button>
        </div>
      ) : !observed.length ? (
        <div className="chart-empty">
          <ChartNoAxesCombined />
          <p>
            {indicator === "wages"
              ? "Data unavailable"
              : "No data available for this country and period."}
          </p>
        </div>
      ) : (
        <>
          <div className="chart-unit">
            {unitLabel(indicator, series?.wageBasis?.baseYear)}
          </div>
          <div className="chart-plot">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={rows}
                margin={{ top: 10, right: 15, bottom: 12, left: 0 }}
                accessibilityLayer
              >
                <CartesianGrid
                  stroke="#28303a"
                  strokeDasharray="3 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#929dab", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#929dab",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  tick={{ fill: "#929dab", fontSize: 12 }}
                  tickFormatter={(v) => formatValue(Number(v), meta.unit, true)}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    background: "#161b22",
                    border: "1px solid #465265",
                    borderRadius: 8,
                    color: "#e6edf3",
                  }}
                  labelFormatter={(v) => `Year ${v}`}
                  formatter={(value) => [
                    typeof value === "number"
                      ? formatValue(value, meta.unit)
                      : "No observation",
                    meta.name,
                  ]}
                />
                {meta.unit === "percent" && (
                  <ReferenceLine y={0} stroke="#455162" />
                )}
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#58a6ff"
                  strokeWidth={2.3}
                  dot={
                    indicator === "gini" || observed.length === 1
                      ? { r: 4, fill: "#58a6ff" }
                      : false
                  }
                  strokeOpacity={indicator === "gini" ? 0 : 1}
                  activeDot={{ r: 5, stroke: "#0d1117", strokeWidth: 3 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-actions">
            <CsvDownload
              filename={`econlens-${country.code}-${indicator}.csv`}
              rows={[
                [
                  "Country",
                  "Indicator",
                  "Year",
                  "Value",
                  "Unit",
                  "Source",
                  "Provider status",
                ],
                ...rows.map((row) => [
                  country.code,
                  meta.name,
                  row.year,
                  row.value,
                  unitLabel(indicator, series?.wageBasis?.baseYear),
                  sourceUrl(indicator),
                  row.status ?? "",
                ]),
              ]}
            />
          </div>
          <details className="data-details">
            <summary>View observations ({observed.length})</summary>
            <div className="table-scroll">
              <table>
                <caption>
                  {meta.name} ·{" "}
                  {unitLabel(indicator, series?.wageBasis?.baseYear)}
                </caption>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Value</th>
                    {indicator === "wages" && <th>OECD status</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.toReversed().map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>
                        {row.value === null
                          ? "No observation"
                          : formatValue(row.value, meta.unit)}
                      </td>
                      {indicator === "wages" && <td>{row.status ?? "—"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          {indicator === "wages" && (
            <p className="provider-status-note">
              OECD status: A = normal value. Other codes are retained as
              supplied; consult OECD for their interpretation. No provider
              update date is supplied with this series.
            </p>
          )}
        </>
      )}
      <div className="chart-footer">
        <a href={sourceUrl(indicator)} target="_blank" rel="noreferrer">
          Source: {sourceName(indicator)}
          <ExternalLink size={12} />
        </a>
        <span>
          {latest
            ? `Latest available: ${latest.year}`
            : indicator === "gini"
              ? "Survey observations"
              : "Annual observations"}
        </span>
      </div>
    </section>
  );
}

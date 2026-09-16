"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { resolveCountry } from "@/lib/countries";
import { available, formatValue, inPeriod } from "@/lib/format";
import { indicators, sourceUrl, sourceName, unitLabel } from "@/lib/indicators";
import { useSeries, requestKey } from "@/lib/use-series";
import type { IndicatorKey } from "@/types/economics";
import { IndicatorChart } from "./charts/indicator-chart";
import { KpiCard } from "./kpi-card";
import { PeriodSelector, usePeriod } from "./period-selector";
const configuration = {
  wages: {
    title: "Wages and earnings",
    keys: ["wages"],
    heading: "What do average wages measure?",
    explanation:
      "OECD average annual wages measure gross earnings per dependent employee on a full-time-equivalent basis. This view uses constant-price US dollars converted with purchasing power parities for private consumption. The price-base year is supplied by OECD. These are mean earnings before personal taxes and employee contributions, not median wages, household income, or take-home pay.",
  },
  inflation: {
    title: "Inflation",
    keys: ["inflation"],
    heading: "What is inflation?",
    explanation:
      "Inflation measures how consumer prices change over time. This series reports the annual percentage change in a consumer price index. Falling inflation means prices are rising more slowly; a negative rate means average prices fell.",
  },
  gdp: {
    title: "Gross domestic product",
    keys: ["gdp", "growth", "perCapita"],
    heading: "Three views of economic output",
    explanation:
      "GDP measures total production. GDP growth tracks real changes in output, while GDP per capita divides output by population. GDP and GDP per capita here use current US dollars, so prices and exchange rates affect comparisons. They are not adjusted for purchasing power.",
  },
  labor: {
    title: "Labor market",
    keys: ["unemployment", "participation", "employment"],
    heading: "Understanding labor market measures",
    explanation:
      "The unemployment rate is the share of the labor force without work but available for and seeking employment. This series is a modeled ILO estimate distributed by World Bank. Participation includes employed and unemployed people as a share of the population aged 15+. The employment-to-population ratio counts only employed people in that same age group. These modeled annual series may differ from national monthly releases.",
  },
  inequality: {
    title: "Economic inequality",
    keys: ["gini"],
    heading: "Understanding the Gini index",
    explanation:
      "The World Bank Gini index ranges from 0 (perfect equality) to 100 (perfect inequality). It measures the distribution of income or, in some cases, consumption. Survey methods, welfare definitions, and coverage can differ across countries and years, so observations are not always directly comparable.",
  },
} as const;
export type Topic = keyof typeof configuration;
export function IndicatorPage({ topic }: { topic: Topic }) {
  const params = useSearchParams();
  const router = useRouter();
  const country = resolveCountry(params.get("country"));
  const config = configuration[topic];
  const period = usePeriod();
  const selected = params.get("series");
  const selectedIndicator: IndicatorKey = (
    config.keys as readonly string[]
  ).includes(selected ?? "")
    ? (selected as IndicatorKey)
    : config.keys[0];
  const { data, retry } = useSeries(
    config.keys.map((indicator) => ({ country: country.code, indicator })),
  );
  const series =
    data[requestKey({ country: country.code, indicator: selectedIndicator })];
  const meta = indicators[selectedIndicator];
  const rows = available(inPeriod(series?.observations ?? [], period));
  const highest = rows.reduce<(typeof rows)[number] | undefined>(
    (best, r) => (!best || r.value > best.value ? r : best),
    undefined,
  );
  const lowest = rows.reduce<(typeof rows)[number] | undefined>(
    (best, r) => (!best || r.value < best.value ? r : best),
    undefined,
  );
  return (
    <>
      <div className="intro">
        <span className="eyebrow">ECONLENS / INDICATOR RESEARCH</span>
        <h1>{config.title}</h1>
        <p>
          {country.flag} {country.name} · {country.iso3} · Source:{" "}
          {sourceName(selectedIndicator)}
        </p>
      </div>
      {topic === "wages" && (
        <div className="coverage-note">
          <Info size={18} />
          <p>
            {series?.wageBasis
              ? `${unitLabel("wages", series.wageBasis.baseYear)} · Gross annual mean · Full-time equivalent employees.`
              : "Only a verified constant-price, PPP-adjusted OECD series will be shown. Incompatible or missing series are left unavailable."}{" "}
            No nominal or local-currency wage series are substituted. Provider
            status codes are included in the observations table.
          </p>
        </div>
      )}
      {topic === "labor" && (
        <p className="labor-context">
          Participation and employment ratios use the population aged 15+ as
          their denominator; unemployment uses the labor force. Additional
          indicators appear only after data is retrieved.
        </p>
      )}
      <div className="detail-kpis">
        <KpiCard indicator={selectedIndicator} series={series} retry={retry} />
        {[
          { name: "Highest in selected period", row: highest },
          { name: "Lowest in selected period", row: lowest },
        ].map((stat) => (
          <article className="kpi" key={stat.name}>
            <h2>{stat.name}</h2>
            {!series ? (
              <div
                className="skeleton kpi-skeleton"
                aria-label="Loading statistics"
              />
            ) : series.error ? (
              <p className="muted">Unable to load data.</p>
            ) : stat.row ? (
              <>
                <div className="kpi-value">
                  {formatValue(
                    stat.row.value,
                    meta.unit,
                    selectedIndicator === "gdp",
                  )}
                </div>
                <p className="kpi-date">Observation: {stat.row.year}</p>
              </>
            ) : (
              <p className="muted">No data available</p>
            )}
          </article>
        ))}
      </div>
      <div className="section-toolbar">
        <div>
          <h2>Historical observations</h2>
          <p>Window ends at this series’ latest available observation.</p>
        </div>
        <PeriodSelector />
      </div>
      {(topic === "gdp" || topic === "labor") && (
        <div
          className="indicator-tabs"
          role="group"
          aria-label={`${topic === "gdp" ? "GDP" : "Labor"} indicator`}
        >
          {config.keys
            .filter(
              (key) =>
                topic !== "labor" ||
                key === "unemployment" ||
                available(
                  data[requestKey({ country: country.code, indicator: key })]
                    ?.observations ?? [],
                ).length > 0,
            )
            .map((key) => (
              <button
                key={key}
                aria-pressed={selectedIndicator === key}
                onClick={() => {
                  const next = new URLSearchParams(params.toString());
                  next.set("series", key);
                  router.replace(`/${topic}?${next}`, { scroll: false });
                }}
              >
                {indicators[key].name}
              </button>
            ))}
        </div>
      )}
      {topic === "inequality" && (
        <div className="coverage-note">
          <Info size={18} />
          <p>
            Survey observations are often nonannual. Points show reported
            observations only; missing years are not interpolated. Methodology
            and income versus consumption coverage can differ.
          </p>
        </div>
      )}
      <div className="detail-chart">
        <IndicatorChart
          indicator={selectedIndicator}
          series={series}
          period={period}
          retry={retry}
        />
      </div>
      <section className="education-card">
        <h2>{config.heading}</h2>
        <p>{config.explanation}</p>
        <a href={sourceUrl(selectedIndicator)} target="_blank" rel="noreferrer">
          Read the source definition ↗
        </a>
      </section>
    </>
  );
}

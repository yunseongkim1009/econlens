import type { Indicator, IndicatorKey } from "@/types/economics";
export const indicators: Record<IndicatorKey, Indicator> = {
  wages: {
    code: "DSD_EARNINGS@AV_AN_WAGE",
    name: "Average annual wages",
    unit: "usd",
    chartTitle: "Average annual wages",
    description:
      "Gross average wages per full-time-equivalent employee, in constant PPP-adjusted US dollars.",
  },
  participation: {
    code: "SL.TLF.CACT.ZS",
    name: "Labor force participation",
    unit: "percent",
    chartTitle: "Labor force participation",
    description:
      "Economically active population as a share of people aged 15+; modeled ILO estimate.",
  },
  employment: {
    code: "SL.EMP.TOTL.SP.ZS",
    name: "Employment-to-population ratio",
    unit: "percent",
    chartTitle: "Employment-to-population ratio",
    description:
      "Employed people as a share of the population aged 15+; modeled ILO estimate.",
  },
  gdp: {
    code: "NY.GDP.MKTP.CD",
    name: "GDP",
    unit: "usd",
    chartTitle: "Gross domestic product",
    description:
      "Total economic output in current US dollars; not adjusted for inflation.",
  },
  gini: {
    code: "SI.POV.GINI",
    name: "Gini index",
    unit: "index",
    chartTitle: "Income and consumption inequality",
    description:
      "Survey-based Gini index, 0–100. Higher values indicate greater inequality.",
  },
  inflation: {
    code: "FP.CPI.TOTL.ZG",
    name: "Inflation",
    unit: "percent",
    chartTitle: "Inflation over time",
    description: "Annual change in consumer prices (CPI).",
  },
  growth: {
    code: "NY.GDP.MKTP.KD.ZG",
    name: "GDP growth",
    unit: "percent",
    chartTitle: "GDP growth",
    description: "Annual growth in real gross domestic product.",
  },
  unemployment: {
    code: "SL.UEM.TOTL.ZS",
    name: "Unemployment",
    unit: "percent",
    chartTitle: "Unemployment rate",
    description: "Share of the labor force unemployed; modeled ILO estimate.",
  },
  perCapita: {
    code: "NY.GDP.PCAP.CD",
    name: "GDP per capita",
    unit: "usd",
    chartTitle: "GDP per capita",
    description:
      "Current US dollars per person; not adjusted for inflation or purchasing power.",
  },
  population: {
    code: "SP.POP.TOTL",
    name: "Population",
    unit: "people",
    chartTitle: "Population",
    description:
      "Total population, based on the de facto definition of population.",
  },
};
export const indicatorKeys = Object.keys(indicators) as IndicatorKey[];
export const sourceUrl = (key: IndicatorKey) =>
  key === "wages"
    ? "https://www.oecd.org/en/data/indicators/average-annual-wages.html"
    : `https://data.worldbank.org/indicator/${indicators[key].code}`;

export const overviewKeys: IndicatorKey[] = [
  "inflation",
  "growth",
  "unemployment",
  "perCapita",
  "population",
];
export function unitLabel(key: IndicatorKey, baseYear?: number) {
  if (key === "wages")
    return `Constant ${baseYear ?? "base-year"} US$ (PPP) per employee`;
  return key === "gini"
    ? "Gini index (0–100)"
    : key === "perCapita"
      ? "Current US$ per person"
      : key === "gdp"
        ? "Current US$"
        : indicators[key].unit === "percent"
          ? "Percent (%)"
          : "People";
}

export const sourceName = (key: IndicatorKey) =>
  key === "wages" ? "OECD" : "World Bank";

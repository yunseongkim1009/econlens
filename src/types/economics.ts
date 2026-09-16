export type IndicatorKey =
  | "inflation"
  | "growth"
  | "unemployment"
  | "perCapita"
  | "population"
  | "gdp"
  | "gini"
  | "wages"
  | "participation"
  | "employment";
export type Period = "5" | "10" | "20" | "max";
export type Observation = {
  year: number;
  value: number | null;
  status?: string;
};
export type Series = {
  indicator: IndicatorKey;
  observations: Observation[];
  updated: string | null;
  error?: string;
  wageBasis?: {
    baseYear: number;
    currency: "USD_PPP";
    priceBase: "constant";
    frequency: "annual";
    coverage: "full-time equivalent employees";
  };
};
export type Indicator = {
  code: string;
  name: string;
  unit: "percent" | "usd" | "people" | "index";
  description: string;
  chartTitle: string;
};

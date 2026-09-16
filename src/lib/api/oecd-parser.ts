import { parseCsv } from "../csv.ts";
import type { Series, Observation } from "@/types/economics";
/** Fail closed: never mix nominal/local-currency, population, price-base, or aggregation variants. */
export function parseWages(csv: string, iso3: string): Series {
  const [header, ...rows] = parseCsv(csv);
  const required = [
    "REF_AREA",
    "MEASURE",
    "UNIT_MEASURE",
    "PAY_PERIOD",
    "PRICE_BASE",
    "AGGREGATION_OPERATION",
    "SEX",
    "TIME_PERIOD",
    "OBS_VALUE",
    "BASE_PER",
    "OBS_STATUS",
    "UNIT_MULT",
  ];
  if (!header || !required.every((field) => header.includes(field)))
    throw new Error("Unexpected OECD wage schema");
  const records = rows.map((row) => {
    if (row.length !== header.length) throw new Error("Invalid OECD CSV row");
    return Object.fromEntries(header.map((key, i) => [key, row[i]]));
  });
  const selected = records.filter(
    (r) =>
      r.REF_AREA === iso3 &&
      r.MEASURE === "WG" &&
      r.UNIT_MEASURE === "USD_PPP" &&
      r.PAY_PERIOD === "A" &&
      r.PRICE_BASE === "Q" &&
      r.AGGREGATION_OPERATION === "MEAN" &&
      r.SEX === "_Z",
  );
  if (!selected.length)
    return { indicator: "wages", observations: [], updated: null };
  const bases = new Set(selected.map((r) => r.BASE_PER));
  if (bases.size !== 1 || !/^\d{4}$/.test(selected[0].BASE_PER))
    throw new Error("Incompatible wage price bases");
  const seen = new Set<number>();
  const observations: Observation[] = selected
    .map((r) => {
      if (!/^\d{4}$/.test(r.TIME_PERIOD) || r.UNIT_MULT !== "0")
        throw new Error("Unsupported wage period or multiplier");
      const year = Number(r.TIME_PERIOD);
      if (seen.has(year)) throw new Error("Duplicate wage observations");
      seen.add(year);
      const value = r.OBS_VALUE.trim() === "" ? null : Number(r.OBS_VALUE);
      if (value !== null && (!Number.isFinite(value) || value < 0))
        throw new Error("Invalid wage value");
      return { year, value, status: r.OBS_STATUS || "unspecified" };
    })
    .sort((a, b) => a.year - b.year);
  return {
    indicator: "wages",
    observations,
    updated: null,
    wageBasis: {
      baseYear: Number(selected[0].BASE_PER),
      currency: "USD_PPP",
      priceBase: "constant",
      frequency: "annual",
      coverage: "full-time equivalent employees",
    },
  };
}

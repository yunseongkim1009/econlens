import "server-only";
import { countries } from "@/lib/countries";
import { parseWages } from "./oecd-parser";
import type { Series } from "@/types/economics";
export async function getWages(country: string): Promise<Series> {
  const selected = countries.find((c) => c.code === country);
  if (!selected) throw new Error("Unsupported country");
  const url = `https://sdmx.oecd.org/public/rest/v1/data/OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0/${selected.iso3}.WG.USD_PPP.A.Q.MEAN._Z?format=csvfile`;
  const response = await fetch(url, {
    // OECD may return HTTP 500 when Node sends its default wildcard language.
    headers: { "Accept-Language": "en" },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 404 || response.status === 204)
    return { indicator: "wages", observations: [], updated: null };
  if (!response.ok) throw new Error(`OECD returned ${response.status}`);
  return parseWages(await response.text(), selected.iso3);
}

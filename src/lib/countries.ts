export const countries = [
  { code: "US", iso3: "USA", name: "United States", flag: "🇺🇸" },
  { code: "KR", iso3: "KOR", name: "South Korea", flag: "🇰🇷" },
  { code: "JP", iso3: "JPN", name: "Japan", flag: "🇯🇵" },
  { code: "GB", iso3: "GBR", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", iso3: "DEU", name: "Germany", flag: "🇩🇪" },
  { code: "FR", iso3: "FRA", name: "France", flag: "🇫🇷" },
  { code: "CA", iso3: "CAN", name: "Canada", flag: "🇨🇦" },
  { code: "AU", iso3: "AUS", name: "Australia", flag: "🇦🇺" },
] as const;
export function resolveCountry(code: string | null) {
  return countries.find((c) => c.code === code?.toUpperCase()) ?? countries[0];
}

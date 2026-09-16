# EconLens

A focused economic research dashboard for exploring country-level indicators over time. Built with Next.js App Router and real World Bank and OECD data, with explicit source attribution, observation dates, and missing-data handling.

**Built by Yunseong Kim** · [Portfolio](https://yunseong-kim.vercel.app/)

## Screenshots

<!-- Add real desktop and mobile screenshots here after choosing a deployment. Never use fabricated statistics. -->

Screenshots will be added after the initial deployment.

## Features

- Dark research workspace with responsive sidebar and mobile navigation.
- Searchable country picker: United States, South Korea, Japan, United Kingdom, Germany, France, Canada, and Australia. Search by name, ISO alpha-2, or alpha-3 code.
- Five KPI cards: inflation, real GDP growth, unemployment, nominal GDP per capita, and population.
- Four Recharts time-series charts with tooltips, units, annual axes, source links, and accessible observation tables.
- 5Y, 10Y, 20Y, and MAX windows, anchored to each indicator’s latest available observation.
- Shareable country and period state, e.g. `/?country=KR&period=20`. The country remains selected between Overview and About.
- Independent loading and error states. A failed indicator does not suppress successful results. Retry reloads the overview.
- Server-side World Bank service with validation, six-hour caching, and a 15-second upstream timeout.
- An About page documenting purpose, methodology, and limitations.

**Scope:** Phases 1–3 are implemented, including OECD wages and expanded labor indicators.

### Phase 3

- `/wages`: OECD gross average annual wages per full-time-equivalent employee, in constant PPP-adjusted US dollars. The response supplies the price-base year; it is never assumed. No nominal/local-currency substitute is used. Missing compatible series show **Data unavailable**.
- `/labor`: participation and employment-to-population ratios for ages 15+ (modeled ILO estimates). Additional selector options appear only after observations are retrieved.
- CSV downloads for individual charts and comparisons, containing unrounded values, dates, units, sources, and OECD status codes where applicable. Missing values remain blank.
- Shared client caching across overview/detail/comparison views: successful series reused for five minutes. Retry invalidates that client cache. World Bank server caching remains six hours; OECD caching is 24 hours.
- Arrow-key country navigation, focus handling, responsive navigation fixes, and reduced-motion support.
- Regression tests for strict wage-series selection, CSV preservation and escaping, cache invalidation, failures, and aborted consumers.

### Phase 2

- `/compare`: choose 2–5 countries and inflation, GDP growth, GDP per capita, unemployment, population, or compatible OECD wages. Wage comparisons fail closed unless the available series share the same verified currency, price base, frequency, and employee coverage. Shared calendar axis, distinct line styles, observation tables, latest values with individual years, partial loading/error handling, and shareable selections.
- `/inflation`: latest observation, change, period high/low, historical chart, and concise explanation.
- `/gdp`: switch among nominal GDP, real GDP growth, and nominal GDP per capita.
- `/labor`: modeled ILO unemployment series and methodological context.
- `/inequality`: Gini index on a **0–100** scale; survey observations shown as points with no interpolation. Methodological differences are explained.

Example: `/compare?countries=US,KR,JP&indicator=perCapita&period=20`. Comparison inputs are deduplicated, allowlisted, and limited to five countries. Invalid selections with fewer than two countries fall back to US and South Korea.

Individual charts end at each series’ own latest observation. Comparison charts use the latest year across selected countries, with explicit nulls for absent country-years. The latest-value table can contain older values outside the plotted window and labels their years.

## Tech stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · Recharts · Lucide React · ESLint 9

No authentication, database, paid API, or API key is needed. OECD wage requests are also keyless. The server route provides the backend boundary; there are no direct provider requests inside UI components. Charts and controls are client components, while provider access stays server-only.

## Getting started

Use Node.js **22.13 or later** (a current LTS release is recommended) and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

No environment setup is required. `.env.example` documents the only runtime requirement: outbound HTTPS access to `api.worldbank.org` and `sdmx.oecd.org`. First-time requests depend on provider response time. No fake fallback data is bundled.

```bash
npm run lint       # ESLint
npm run typecheck  # Strict TypeScript check
npm test           # Data-window and formatting regression checks
npm run build      # Production compilation
npm start          # Serve the production build
```

If your operating system reports `EMFILE` while watching files, try `WATCHPACK_POLLING=true npm run dev` on macOS/Linux. This is a local watcher workaround, not a production requirement.

## Deploy on Vercel

Push this project directory to a GitHub repository, import that repository into Vercel, and select the Next.js preset. Use `npm run build` and the default output settings. No environment secrets are needed. If imported from a monorepo, set the root directory to the directory containing this README and `package.json`.

The application requires a Next.js server runtime; do not use static export. No Vercel-specific SDK or custom deployment adapter is required. Hosting is not provisioned by this repository.

## Data sources and definitions

Most displayed series come from World Bank **World Development Indicators (source 2)** through the [Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392). Metadata was checked against World Bank documentation during implementation.

| Indicator      | World Bank code                                                             | Interpretation                                                 |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Inflation      | [FP.CPI.TOTL.ZG](https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG)       | Annual CPI percentage change, not a monthly inflation print    |
| GDP growth     | [NY.GDP.MKTP.KD.ZG](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG) | Annual real GDP growth                                         |
| Unemployment   | [SL.UEM.TOTL.ZS](https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS)       | Percent of the labor force; modeled ILO estimate               |
| GDP per capita | [NY.GDP.PCAP.CD](https://data.worldbank.org/indicator/NY.GDP.PCAP.CD)       | Current US dollars per person; neither constant prices nor PPP |
| Population     | [SP.POP.TOTL](https://data.worldbank.org/indicator/SP.POP.TOTL)             | Total population                                               |

World Bank is the distributor; original compilers vary, including national agencies, IMF, and ILO. Follow each indicator link for complete definitions and provenance. Data is subject to the provider’s applicable [terms and attribution requirements](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets).

### Methodology

- Values are not fabricated, estimated by the app, interpolated, or filled with zero.
- Latest means the most recent **non-null observation for that series**, not the current calendar year. Provider update dates are distinct from observation years.
- Change compares the two latest available observations. Percentage-based series use **percentage points**; currency and population changes remain in their original units. The reference observation year appears on each card.
- Windows use calendar years and end at the last non-null year of each series. A 5Y view includes that year and four preceding years, where available. KPI values do not change when a chart window changes.
- Missing observations appear as chart gaps. Straight segments connect annual observations, not invented monthly or daily measurements. Accessible tables expose the actual values and gaps.
- API response shape, finite numeric values, year format, HTTP status, and pagination are checked. API inputs are allowlisted. Each country/indicator is fetched independently and cached by Next.js for six hours. Failed requests show an explicit error.
- No global “good/bad” interpretation is attached to rising or falling indicators; directional changes use neutral styling.

## Project structure

```text
src/
  app/
    api/indicators/route.ts      # Validated backend endpoint
    compare/page.tsx            # Cross-country comparisons
    inflation|gdp|labor|inequality/page.tsx # Dedicated indicators
    about/page.tsx              # Purpose and methodology
    page.tsx                    # Overview entry point
    layout.tsx                  # Metadata and shared shell
    loading.tsx / error.tsx     # Route boundaries
    globals.css                 # Tailwind import and dashboard theme
  components/
    charts/indicator-chart.tsx  # Reusable chart and data table
    country-selector.tsx       # Searchable country control
    dashboard.tsx              # Independent loading and URL state
    kpi-card.tsx                # Latest values and observation changes
    shell.tsx                  # Navigation and top bar
  lib/
    api/oecd.ts                # Server-only OECD wage provider
    api/oecd-parser.ts         # Fail-closed SDMX CSV normalization
    csv.ts                     # CSV parsing and export escaping
    api/worldBank.ts           # Server-only provider service
    api/client.ts              # Browser-to-backend transport
    comparison.ts             # Shared calendar alignment, null preservation
    use-series.ts             # Abortable independent requests for detail/compare views
    countries.ts               # Supported country metadata
    indicators.ts              # Central definitions and source links
    format.ts                  # Formatting and calendar windows
  types/economics.ts            # Shared typed contracts
public/favicon.svg
tests/economics.test.mjs
```

## API

`GET /api/indicators?country=US&indicator=inflation`

Returns `{ indicator, observations: [{ year, value }], updated }`. `value` may be null. `updated` is the provider dataset update date, not the latest observation year. Supported indicator keys are `inflation`, `growth`, `unemployment`, `perCapita`, and `population`, `gdp`, `gini`, `wages`, `participation`, and `employment`. Invalid inputs return 400; upstream failures return 502 without disclosing provider internals to clients.

### Additional indicator definitions

| Indicator  | World Bank code                                                       | Interpretation                                                                  |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| GDP        | [NY.GDP.MKTP.CD](https://data.worldbank.org/indicator/NY.GDP.MKTP.CD) | Total GDP at current prices in US dollars                                       |
| Gini index | [SI.POV.GINI](https://data.worldbank.org/indicator/SI.POV.GINI)       | Survey-based income or consumption inequality, 0–100; not a percent growth rate |

Gini changes are index points and may compare nonconsecutive survey years. Points represent provider-reported observations; no line is drawn between them. Existing provider estimates are not estimates created by this application.

## Roadmap

1. **Completed Phase 2:** comparison of 2–5 countries and dedicated inflation, GDP, labor, and inequality pages.
2. **Completed Phase 3:** strict OECD wage adapter and compatible cross-country wage comparisons, additional labor ratios, CSV chart exports, cache reuse, keyboard improvements, and an opt-in development accessibility audit.
3. Provider contract tests, end-to-end browser regression coverage, broader country coverage, and a documented release workflow.

For new providers, normalize into the shared series contract and register metadata centrally. Wage contracts must additionally identify currency, price base, frequency, population coverage, and comparability. Do not reuse an unqualified nominal wage number across countries. Return unavailable when a compatible series cannot be retrieved.

## Limitations

- Annual data is delayed and revised; this is not a real-time terminal.
- Latest observation years can differ across countries and indicators. Missing values and provider outages are expected.
- GDP per capita is not disposable income or a direct living-standards comparison; exchange rates and prices affect nominal US-dollar values.
- Unemployment definitions and models differ from headline national monthly releases.
- The initial country list is deliberately limited to eight countries.
- Provider-side estimates may be present (notably ILO modeled unemployment). “No estimates” refers to EconLens not inventing or interpolating data itself.
- Automated tests cover data transformations, not the entire browser or live-provider contract. Provider availability must be checked independently.
- EconLens does not provide financial advice. Verify original datasets for serious research.

## License

Code is released under the [MIT License](LICENSE). Economic data retains its original provider terms and is not relicensed by this project.

## Author

Built by **Yunseong Kim**.

[Portfolio — yunseong-kim.vercel.app](https://yunseong-kim.vercel.app/)

## Wage data contract

Source: [OECD Average annual wages](https://www.oecd.org/en/data/indicators/average-annual-wages.html), via `OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0`.

The adapter requires `WG` (wages), `USD_PPP`, annual pay period `A`, constant prices `Q`, `MEAN`, sex dimension `_Z` (not applicable), and unscaled units (`UNIT_MULT=0`). It filters by the requested ISO-3 country and rejects duplicate years, incompatible/missing price bases, unexpected schemas, and invalid numeric values. It never converts currencies itself. The series contract includes `wageBasis` with base year, currency, price basis, frequency, and population coverage. OECD observation status codes are preserved; `A` denotes normal values, other codes should be checked with the provider. The CSV response has no dataset update timestamp, so `updated` is null.

These are gross means, not medians or disposable income. PPP and constant prices address particular comparability issues but do not remove all methodological differences. Cross-country wage charts are shown only when the available series share a verified base year, currency, price basis, frequency, and employee coverage; otherwise the comparison fails closed with an explanation.

Additional World Bank indicators: [participation, SL.TLF.CACT.ZS](https://data.worldbank.org/indicator/SL.TLF.CACT.ZS) and [employment-to-population ratio, SL.EMP.TOTL.SP.ZS](https://data.worldbank.org/indicator/SL.EMP.TOTL.SP.ZS). Both use total population aged 15+ and modeled ILO estimates; unemployment uses the labor force as its denominator.

OECD data retains [OECD terms of use](https://www.oecd.org/en/about/terms-conditions.html), separate from the project’s code license. Live sources can throttle requests or change schemas; such failures show an error, never substituted statistics.

CSV exports are served through a same-origin `POST /api/export` attachment response. The endpoint validates the submitted table and filename, escapes spreadsheet formula-like strings, and does not persist export data. It exports exactly the displayed series window, including blank missing values.

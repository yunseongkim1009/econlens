<div align="center">

<img src="public/favicon.svg" width="72" height="72" alt="EconLens logo" />

# EconLens

### See the economy through data.

A modern economic research dashboard for exploring, visualizing, and comparing major indicators across countries and over time.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![World Bank](https://img.shields.io/badge/Data-World%20Bank-58A6FF?style=flat-square)](https://data.worldbank.org/)
[![OECD](https://img.shields.io/badge/Data-OECD-7EE7C0?style=flat-square)](https://www.oecd.org/en/data.html)
[![CI](https://github.com/yunseongkim1009/econlens/actions/workflows/ci.yml/badge.svg)](https://github.com/yunseongkim1009/econlens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8B949E?style=flat-square)](LICENSE)

[**Live demo**](https://econlens-one.vercel.app/) · [Features](#features) · [Data](#data-sources) · [Getting started](#getting-started) · [Architecture](#architecture) · [Roadmap](#roadmap)

</div>

---

EconLens combines the density of an economic terminal with the clarity of a modern dashboard. It uses live, reputable public datasets and always shows the observation year, unit, and source. Missing observations remain missing—EconLens never invents, interpolates, or silently substitutes economic data.

## Preview

> Live at [econlens-one.vercel.app](https://econlens-one.vercel.app/).

| Overview | Country comparison |
| :------: | :----------------: |
| Dark research workspace with five headline indicators and historical charts | Compare 2–5 economies on a shared calendar with explicit gaps |

## Features

<table>
<tr>
<td width="50%" valign="top">

### Research workspace

- Inflation, GDP, labor, wages, inequality, and population
- Five headline KPI cards with observation dates and changes
- Interactive 5Y, 10Y, 20Y, and MAX chart windows
- Tooltips, source links, units, and accessible data tables
- Responsive desktop, tablet, and mobile layouts

</td>
<td width="50%" valign="top">

### Country comparison

- Compare 2–5 countries on one chart
- Shareable selections through URL parameters
- Latest-value table with country-specific observation years
- Compatible OECD wage comparisons with verified price bases
- CSV exports with unrounded observations and source metadata

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Reliable data handling

- Independent loading, error, empty, and retry states
- Strict provider-response validation
- Missing values remain gaps and are never converted to zero
- No fabricated fallback statistics
- Server and client caching with explicit invalidation

</td>
<td width="50%" valign="top">

### Accessible interaction

- Semantic navigation and labeled controls
- Keyboard-friendly searchable country selector
- Visible focus states and reduced-motion support
- Screen-reader-friendly chart context and observation tables
- Opt-in development audit powered by axe-core

</td>
</tr>
</table>

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Economic overview with inflation, GDP growth, unemployment, GDP per capita, and population |
| `/inflation` | Latest inflation, recent change, period high/low, and historical CPI inflation |
| `/gdp` | Nominal GDP, real GDP growth, and nominal GDP per capita |
| `/labor` | Unemployment, labor-force participation, and employment-to-population ratios |
| `/wages` | Verified OECD average annual wages in constant PPP-adjusted US dollars |
| `/inequality` | Survey-based Gini observations without interpolation |
| `/compare` | Shared-calendar comparison for 2–5 countries |
| `/about` | Purpose, methodology, data sources, and limitations |

EconLens currently supports 28 economies across North America, Latin America, Europe, Asia, Africa, and Oceania. Search by country name, ISO alpha-2 code, or ISO alpha-3 code. Wage coverage remains narrower because the OECD series is shown only when a compatible observation exists.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript with strict checking |
| Styling | Tailwind CSS 4 and shared design tokens |
| Visualization | Recharts |
| Icons | Lucide React |
| Data providers | World Bank Indicators API and OECD SDMX API |
| Quality | ESLint, Node test runner, axe-core |
| Deployment | Vercel-compatible Next.js server runtime |

No authentication, database, paid API, or API key is required.

## Getting started

### Prerequisites

- Node.js **22.13 or later**
- npm
- Outbound HTTPS access to `api.worldbank.org` and `sdmx.oecd.org`

### Install and run

```bash
git clone https://github.com/yunseongkim1009/econlens.git
cd econlens
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or API keys are needed.

### Project checks

```bash
npm run lint       # ESLint
npm run typecheck  # Strict TypeScript check
npm test           # Data, cache, comparison, CSV, and wage-contract tests
npm run test:e2e   # Desktop and mobile browser regression tests
npm run build      # Optimized production build
npm start          # Serve the production build
```

If macOS or Linux reports `EMFILE` during development, run `WATCHPACK_POLLING=true npm run dev`.

## Shareable research views

Country, period, indicator, and comparison choices live in the URL where appropriate, so a view can be bookmarked or shared.

```text
/?country=KR&period=20
/compare?countries=US,KR,JP&indicator=perCapita&period=20
/compare?countries=US,KR,JP&indicator=wages&period=10
```

Inputs are allowlisted, country selections are deduplicated, and comparisons are limited to five economies.

## Data sources

### World Bank World Development Indicators

| Indicator | Code | Unit / interpretation |
| --- | --- | --- |
| Inflation | [`FP.CPI.TOTL.ZG`](https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG) | Annual CPI percentage change |
| GDP | [`NY.GDP.MKTP.CD`](https://data.worldbank.org/indicator/NY.GDP.MKTP.CD) | Current US dollars |
| GDP growth | [`NY.GDP.MKTP.KD.ZG`](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG) | Annual real GDP growth |
| GDP per capita | [`NY.GDP.PCAP.CD`](https://data.worldbank.org/indicator/NY.GDP.PCAP.CD) | Current US dollars per person |
| Unemployment | [`SL.UEM.TOTL.ZS`](https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS) | Share of labor force; modeled ILO estimate |
| Labor-force participation | [`SL.TLF.CACT.ZS`](https://data.worldbank.org/indicator/SL.TLF.CACT.ZS) | Share of population ages 15+; modeled ILO estimate |
| Employment ratio | [`SL.EMP.TOTL.SP.ZS`](https://data.worldbank.org/indicator/SL.EMP.TOTL.SP.ZS) | Share of population ages 15+; modeled ILO estimate |
| Population | [`SP.POP.TOTL`](https://data.worldbank.org/indicator/SP.POP.TOTL) | Total population |
| Gini index | [`SI.POV.GINI`](https://data.worldbank.org/indicator/SI.POV.GINI) | Survey-based index on a 0–100 scale |

World Bank is the distributor; original compilers vary by indicator and include national agencies, the IMF, and the ILO. Review the original metadata before using observations for serious research.

### OECD wages

Average annual wages come from [OECD Average annual wages](https://www.oecd.org/en/data/indicators/average-annual-wages.html), dataset `OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0`.

The adapter accepts only gross mean wages per full-time-equivalent dependent employee in annual, constant-price, PPP-adjusted US dollars. It validates the currency, price basis, base year, frequency, population coverage, scale, country, schema, and duplicate years. Cross-country wage charts fail closed unless the available series share a compatible verified basis.

## Methodology

- **Latest available** means the newest non-null observation for that series. It does not mean the current calendar year.
- Changes compare the two latest available observations. Percentage series use percentage points.
- Time windows use calendar years and end at the series’ latest observation. KPI values do not change with the chart window.
- Missing observations appear as gaps. EconLens does not interpolate, carry values forward, or replace them with zero.
- Comparison charts use a shared calendar. Each country’s latest-value row retains its own observation year.
- Gini observations are shown as discrete survey points because coverage is not necessarily annual.
- Rising and falling indicators use neutral directional styling rather than a universal good/bad interpretation.

## Architecture

```text
src/
├── app/
│   ├── api/
│   │   ├── indicators/route.ts   # Validated provider boundary
│   │   └── export/route.ts       # Safe CSV attachment response
│   ├── compare/                   # Cross-country research
│   ├── inflation/ gdp/ labor/     # Indicator workspaces
│   ├── wages/ inequality/ about/
│   ├── layout.tsx                 # Metadata and shared shell
│   └── page.tsx                   # Overview
├── components/
│   ├── charts/indicator-chart.tsx
│   ├── country-selector.tsx
│   ├── dashboard.tsx
│   ├── indicator-page.tsx
│   └── shell.tsx
├── lib/
│   ├── api/worldBank.ts           # World Bank service
│   ├── api/oecd.ts                # OECD wage service
│   ├── api/oecd-parser.ts         # Fail-closed SDMX normalization
│   ├── comparison.ts              # Shared calendar and wage compatibility
│   ├── use-series.ts              # Abortable cached client requests
│   └── indicators.ts              # Central indicator metadata
└── types/economics.ts             # Shared contracts

tests/                              # Transformation and provider-contract tests
e2e/                                # Desktop and mobile browser regressions
.github/workflows/ci.yml             # Pull-request and main-branch checks
```

The UI never calls third-party providers directly. Browser requests go through validated same-origin API routes. World Bank responses are cached for six hours, OECD responses for 24 hours, and successful client series for five minutes. Failed responses are not cached.

## API

```http
GET /api/indicators?country=US&indicator=inflation
```

The response contains the indicator key, an array of `{ year, value }` observations, and the provider dataset-update date. `value` may be `null`; `updated` is not the latest observation year. Invalid inputs return `400`, while provider failures return `502` without exposing internal details.

## Deploy on Vercel

The production deployment is available at **[econlens-one.vercel.app](https://econlens-one.vercel.app/)**.

1. Import this repository into Vercel.
2. Keep the **Next.js** framework preset and default build settings.
3. Deploy—no environment secrets are required.

EconLens needs a Next.js server runtime for its API routes and should not use static export.
See [docs/releasing.md](docs/releasing.md) for the pre-merge, deployment, smoke-test, and rollback workflow.

## Roadmap

- [x] Responsive overview and indicator pages
- [x] Cross-country comparison for 2–5 economies
- [x] Strict OECD wage adapter and compatible wage comparisons
- [x] Additional labor indicators and CSV exports
- [x] Keyboard improvements and development accessibility audit
- [x] End-to-end desktop and mobile browser regression suite
- [x] Broader country coverage across 28 economies
- [x] Public Vercel deployment
- [x] Documented release workflow

## Limitations

- Economic datasets update at different intervals and can be revised.
- Observation years differ across countries and indicators; this is not a real-time terminal.
- Current-dollar GDP comparisons are affected by exchange rates and prices.
- GDP per capita is not disposable income or a complete measure of living standards.
- ILO-modeled labor indicators can differ from headline national releases.
- PPP-adjusted wages improve comparability but do not remove every methodological difference.
- Provider outages, throttling, and schema changes can temporarily make data unavailable.
- EconLens is educational and does not provide financial advice. Verify original providers for serious research.

## Contributing

Issues and focused pull requests are welcome. New data providers should normalize into the shared series contract, document their methodology, and fail closed when observations are incompatible or ambiguous.

## License

The application code is available under the [MIT License](LICENSE). Economic data remains subject to the original providers’ terms: [World Bank](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets) and [OECD](https://www.oecd.org/en/about/terms-conditions.html).

---

<div align="center">

Built by **Yunseong Kim**

[Live demo](https://econlens-one.vercel.app/) · [Portfolio](https://yunseong-kim.vercel.app/) · [GitHub](https://github.com/yunseongkim1009)

</div>

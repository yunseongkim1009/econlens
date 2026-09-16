# Phase 1 validation

Validated during implementation on September 16, 2026.

- ESLint: no errors or warnings after the final correction.
- Strict TypeScript: passed.
- Five data-transformation regression tests: passed.
- Next.js production build: passed.
- Live backend: all five US indicator responses contained valid observations; invalid country input returned HTTP 400.
- Browser: live US, South Korea, and Japan series rendered with individual observation years.
- Country search accepted ISO alpha-3 input (JPN); keyboard Tab/Enter selected Japan.
- Country and period parameters persisted between Overview and About.
- 5Y and MAX controls updated chart state and URL parameters.
- Desktop (1440×1000), tablet (768×1024), and mobile (390×844) layouts inspected. No horizontal document overflow observed on tablet or mobile.
- Mobile navigation opened and moved focus to its close control; offscreen navigation is hidden from keyboard focus.
- Mobile chart labels, tooltips, and sources were visually checked.
- Loading skeletons observed during real requests. No live provider outage was intentionally induced; error and no-data rendering paths were reviewed in source. Full browser failure-injection automation remains future work.

The local host required WATCHPACK_POLLING=true to avoid its file-watcher limit. The production build does not require that setting. This validation is not a comprehensive accessibility audit or a guarantee of continued upstream availability.

## Phase 2 validation

- Lint, strict TypeScript, all nine regression tests, and production build passed.
- All five new pages returned HTTP 200. GDP and Gini backend endpoints returned live provider observations.
- Comparison checkboxes enforce a minimum of two and maximum of five countries.
- Indicator and period changes update the chart and URL; five live country series rendered together.
- Desktop comparison and mobile comparison/detail layouts inspected; mobile comparison had no horizontal document overflow.
- GDP switches between GDP, growth, and per-capita views while retaining country and period.
- Japan Gini rendered discrete survey points and correctly labeled its latest available observation as 2020, rather than the current calendar year.
- Regression tests cover shared calendar alignment, disjoint coverage, null insertion, missing/failed series, zero values, and Gini formatting.
- Browser outage injection and a comprehensive accessibility audit remain outside this validation.

## Phase 3 validation

- ESLint, strict TypeScript, all 17 regression tests, and production build passed.
- Live OECD wage requests succeeded for US, South Korea, and Japan. Each response included constant-price USD_PPP annual mean wages and a provider-supplied 2025 base year.
- Verified World Bank participation and employment-to-population indicators for ages 15+; both live endpoints returned observations.
- OECD's endpoint returned HTTP 500 to the default Node language header. Explicit `Accept-Language: en` resolved the observed incompatibility; this is recorded in the adapter.
- Unit tests reject mixed wage price bases, scaled units, duplicate years, invalid values and schemas. Tests preserve provider flags, missing values, quoted CSV fields, and negative numeric values.
- Client cache tests verify successful reuse, explicit invalidation, non-caching of failures, and aborted consumers.
- Browser arrow-key country selection changed South Korea to Japan and retained focus correctly. Labor indicator switching updated content and URL state.
- Mobile labor layout inspected at 390×844 with no horizontal document overflow. Desktop wage content and explicit source/base-year labels inspected.
- Initial blob-based export could not be confirmed in the embedded browser; implementation was replaced by same-origin server-served CSV attachments. The final browser download event was confirmed.
- Export endpoint returned attachment headers and all 36 Japan wage observations without numeric alteration; invalid filename returned HTTP 400.
- A comprehensive screen-reader audit, cross-browser matrix, and automated browser failure injection remain future work. Checks above should not be described as a full accessibility certification or guarantee of ongoing provider availability.

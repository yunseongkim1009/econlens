# Release workflow

EconLens deploys from the `main` branch to Vercel. The production URL is [econlens-one.vercel.app](https://econlens-one.vercel.app/).

## Before merging

1. Confirm the change does not add fabricated, interpolated, or silently substituted economic observations.
2. Update indicator definitions and source links when a data contract changes.
3. Run the complete local verification suite:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run test:e2e
   npm run build
   ```

4. Check any affected layout at desktop and mobile widths.
5. Confirm new controls work with a keyboard and include an accessible name.

## Merge and deploy

1. Merge the reviewed change to `main` only after GitHub Actions passes.
2. Vercel builds the commit using the Next.js preset and default output settings.
3. Confirm the deployment is marked ready in Vercel.
4. Smoke-test the overview, one detail page, and comparison page on production.
5. Verify at least one World Bank request and, when wages changed, one OECD request.

## Rollback

If production fails, use Vercel to promote the last known-good deployment, then revert the faulty commit on `main`. Do not mask provider failures with fallback statistics.

## Data-provider changes

Provider schema changes require a parser or contract test before release. Wage changes must keep validating country, currency, price basis, base year, frequency, employee coverage, scale, duplicate years, and non-finite values. If compatibility cannot be established, return unavailable data rather than guessing.

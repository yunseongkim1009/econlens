import test from "node:test";
import assert from "node:assert/strict";
import { comparisonRows } from "../src/lib/comparison.ts";
const series = (observations) => ({
  indicator: "growth",
  observations,
  updated: null,
});
test("comparison uses shared calendar years and never carries values forward", () => {
  const rows = comparisonRows(
    {
      US: series([
        { year: 2022, value: 2 },
        { year: 2024, value: 0 },
      ]),
      KR: series([
        { year: 2021, value: -1 },
        { year: 2023, value: 3 },
      ]),
    },
    "5",
  );
  assert.deepEqual(rows, [
    { year: 2021, US: null, KR: -1 },
    { year: 2022, US: 2, KR: null },
    { year: 2023, US: null, KR: 3 },
    { year: 2024, US: 0, KR: null },
  ]);
});
test("window follows latest country, older latest value stays outside it", () => {
  const rows = comparisonRows(
    {
      US: series([{ year: 2025, value: 1 }]),
      KR: series([{ year: 2010, value: 2 }]),
    },
    "5",
  );
  assert.equal(rows.length, 5);
  assert.equal(rows[0].year, 2021);
  assert.equal(rows.at(-1).year, 2025);
  assert.ok(rows.every((row) => row.KR === null));
});
test("empty or failed country does not suppress successful countries", () => {
  assert.deepEqual(comparisonRows({ US: series([]) }, "max"), []);
  const rows = comparisonRows(
    {
      US: series([{ year: 2020, value: 0 }]),
      KR: { ...series([]), error: "Unavailable" },
    },
    "max",
  );
  assert.deepEqual(rows, [{ year: 2020, US: 0, KR: null }]);
});

import { wageCompatibility } from "../src/lib/comparison.ts";
const wage = (baseYear = 2025, patch = {}) => ({
  ...series([{ year: 2024, value: 100 }]),
  indicator: "wages",
  wageBasis: {
    baseYear,
    currency: "USD_PPP",
    priceBase: "constant",
    frequency: "annual",
    coverage: "full-time equivalent employees",
    ...patch,
  },
});
test("wage comparisons require a common complete basis", () => {
  assert.equal(wageCompatibility({ US: wage(), KR: wage() }).compatible, true);
  assert.equal(
    wageCompatibility({ US: wage(), KR: wage(2024) }).compatible,
    false,
  );
  for (const patch of [
    { currency: "USD" },
    { frequency: "monthly" },
    { priceBase: "nominal" },
    { coverage: "households" },
  ])
    assert.equal(
      wageCompatibility({ US: wage(), KR: wage(2025, patch) }).compatible,
      false,
    );
});
test("missing basis and fewer than two usable wage series cannot compare", () => {
  assert.equal(wageCompatibility({ US: wage() }).compatible, false);
  assert.equal(
    wageCompatibility({ US: wage(), KR: series([{ year: 2024, value: 100 }]) })
      .compatible,
    false,
  );
  assert.equal(
    wageCompatibility({ US: wage(), KR: { ...wage(), error: "Failed" } })
      .compatible,
    false,
  );
  assert.equal(
    wageCompatibility({
      US: wage(),
      KR: wage(),
      JP: { ...wage(), error: "Failed" },
    }).compatible,
    true,
  );
});

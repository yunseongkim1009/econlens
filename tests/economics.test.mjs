import test from "node:test";
import assert from "node:assert/strict";
import { available, inPeriod, formatValue } from "../src/lib/format.ts";
const observations = [
  { year: 2019, value: 1 },
  { year: 2020, value: null },
  { year: 2021, value: 0 },
  { year: 2022, value: -2 },
  { year: 2023, value: 3 },
  { year: 2024, value: 4 },
  { year: 2025, value: null },
];
test("zero and negative observations survive; nulls do not become zero", () => {
  assert.deepEqual(
    available(observations).map((r) => r.value),
    [1, 0, -2, 3, 4],
  );
});
test("5Y window ends at latest non-null year and retains missing observations", () => {
  assert.deepEqual(
    inPeriod(observations, "5").map((r) => r.year),
    [2020, 2021, 2022, 2023, 2024],
  );
  assert.equal(inPeriod(observations, "5")[0].value, null);
});
test("MAX excludes future null tail, but includes full available history", () => {
  assert.equal(inPeriod(observations, "max").length, 6);
});
test("short and empty series have no invented history", () => {
  assert.deepEqual(inPeriod([{ year: 2021, value: 10 }], "20"), [
    { year: 2021, value: 10 },
  ]);
  assert.deepEqual(inPeriod([{ year: 2021, value: null }], "max"), []);
});
test("percentage values are already percentages, not fractions", () => {
  assert.equal(formatValue(2.8, "percent"), "2.8%");
  assert.equal(formatValue(-1.2, "percent"), "-1.2%");
  assert.equal(formatValue(50000, "usd"), "$50,000");
});

test("unreported calendar years are explicit nulls, never interpolated", () => {
  assert.deepEqual(
    inPeriod(
      [
        { year: 2020, value: 30 },
        { year: 2022, value: 32 },
      ],
      "5",
    ),
    [
      { year: 2020, value: 30 },
      { year: 2021, value: null },
      { year: 2022, value: 32 },
    ],
  );
  assert.equal(formatValue(31.7, "index"), "31.7");
});

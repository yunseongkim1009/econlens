import test from "node:test";
import assert from "node:assert/strict";
import { parseWages } from "../src/lib/api/oecd-parser.ts";
import { parseCsv, encodeCsv } from "../src/lib/csv.ts";
// Synthetic unit-test fixtures only. Production contains no sample wage observations.
const header =
  "REF_AREA,MEASURE,UNIT_MEASURE,PAY_PERIOD,PRICE_BASE,AGGREGATION_OPERATION,SEX,TIME_PERIOD,OBS_VALUE,BASE_PER,OBS_STATUS,UNIT_MULT";
const row = (patch = {}) => {
  const r = {
    REF_AREA: "USA",
    MEASURE: "WG",
    UNIT_MEASURE: "USD_PPP",
    PAY_PERIOD: "A",
    PRICE_BASE: "Q",
    AGGREGATION_OPERATION: "MEAN",
    SEX: "_Z",
    TIME_PERIOD: "2020",
    OBS_VALUE: "123.45",
    BASE_PER: "2025",
    OBS_STATUS: "A",
    UNIT_MULT: "0",
    ...patch,
  };
  return header
    .split(",")
    .map((k) => r[k])
    .join(",");
};
const csv = (...rows) => header + "\r\n" + rows.join("\r\n");
test("wages preserve basis, value, status, sort order and missing data", () => {
  const result = parseWages(
    csv(row({ TIME_PERIOD: "2021", OBS_VALUE: "" }), row({ OBS_STATUS: "E" })),
    "USA",
  );
  assert.equal(result.wageBasis.baseYear, 2025);
  assert.deepEqual(result.observations, [
    { year: 2020, value: 123.45, status: "E" },
    { year: 2021, value: null, status: "A" },
  ]);
});
test("nominal, foreign-country and local currency variants are excluded", () => {
  const result = parseWages(
    csv(
      row({ PRICE_BASE: "V" }),
      row({ UNIT_MEASURE: "USD" }),
      row({ REF_AREA: "KOR" }),
    ),
    "USA",
  );
  assert.deepEqual(result.observations, []);
});
test("incompatible bases, scaled values and duplicates fail closed", () => {
  assert.throws(
    () =>
      parseWages(
        csv(row(), row({ TIME_PERIOD: "2021", BASE_PER: "2024" })),
        "USA",
      ),
    /price bases/,
  );
  assert.throws(
    () => parseWages(csv(row({ UNIT_MULT: "3" })), "USA"),
    /multiplier/,
  );
  assert.throws(() => parseWages(csv(row(), row()), "USA"), /Duplicate/);
});
test("invalid schema and nonfinite wage data are rejected", () => {
  assert.throws(
    () => parseWages("error,message\n400,no data", "USA"),
    /schema/,
  );
  assert.throws(
    () => parseWages(csv(row({ OBS_VALUE: "Infinity" })), "USA"),
    /value/,
  );
});
test("CSV handles quotes, embedded newlines and blank values", () => {
  const rows = [
    ["country", "value", "note"],
    ["United States", 0, 'quoted "text"\nnext'],
    ["Japan", null, ""],
  ];
  assert.deepEqual(parseCsv(encodeCsv(rows)), [
    ["country", "value", "note"],
    ["United States", "0", 'quoted "text"\nnext'],
    ["Japan", "", ""],
  ]);
});
test("CSV preserves negative numbers but neutralizes spreadsheet formulas", () => {
  assert.equal(encodeCsv([[-3, "=1+1"]]), '"-3","\'=1+1"');
});

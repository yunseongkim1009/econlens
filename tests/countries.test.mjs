import assert from "node:assert/strict";
import test from "node:test";
import { countries, resolveCountry } from "../src/lib/countries.ts";

test("country catalog has unique, well-formed ISO codes", () => {
  assert.equal(countries.length, 28);
  assert.equal(new Set(countries.map(({ code }) => code)).size, countries.length);
  assert.equal(new Set(countries.map(({ iso3 }) => iso3)).size, countries.length);
  for (const country of countries) {
    assert.match(country.code, /^[A-Z]{2}$/);
    assert.match(country.iso3, /^[A-Z]{3}$/);
    assert.ok(country.name.length > 1);
    assert.ok(country.flag.length >= 2);
  }
});

test("country resolution is case-insensitive and safely defaults", () => {
  assert.equal(resolveCountry("de").iso3, "DEU");
  assert.equal(resolveCountry("ZA").name, "South Africa");
  assert.equal(resolveCountry("unknown").code, "US");
  assert.equal(resolveCountry(null).code, "US");
});

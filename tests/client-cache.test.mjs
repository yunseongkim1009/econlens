import test from "node:test";
import assert from "node:assert/strict";
import { fetchSeries, invalidateSeries } from "../src/lib/api/client.ts";
test("successful series are reused, explicit invalidation refetches", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
    invalidateSeries("US", "wages");
  });
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({
      indicator: "wages",
      observations: [],
      updated: null,
    });
  };
  const signal = new AbortController().signal;
  await fetchSeries("US", "wages", signal);
  await fetchSeries("US", "wages", signal);
  assert.equal(calls, 1);
  invalidateSeries("US", "wages");
  await fetchSeries("US", "wages", signal);
  assert.equal(calls, 2);
});
test("failed responses are not cached and aborted consumers are rejected", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
    invalidateSeries("JP", "wages");
  });
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("", { status: 502 });
  };
  const controller = new AbortController();
  await assert.rejects(fetchSeries("JP", "wages", controller.signal));
  await assert.rejects(fetchSeries("JP", "wages", controller.signal));
  assert.equal(calls, 2);
  globalThis.fetch = async () =>
    Response.json({ indicator: "wages", observations: [], updated: null });
  await fetchSeries("JP", "wages", controller.signal);
  controller.abort();
  await assert.rejects(fetchSeries("JP", "wages", controller.signal));
});

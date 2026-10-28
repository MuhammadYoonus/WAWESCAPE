import assert from "node:assert/strict";
import { test } from "node:test";
import { buildTourQuery } from "../src/utils/tourQuery.js";

test("public searches keep visibility and duration constraints with literal search wildcards", () => {
  const query = buildTourQuery({ q: "Ella_100%", duration: "2", sort: "price-asc" });
  assert.match(query.sql, /active = true/);
  assert.match(query.sql, /duration = \?/);
  assert.match(query.sql, /ORDER BY price ASC/);
  assert.deepEqual(query.values, ["2 Days", "%Ella!_100!%%", "%Ella!_100!%%", "%Ella!_100!%%"]);
});

test("sort input cannot inject SQL and management visibility remains parameterized", () => {
  const query = buildTourQuery({ sort: "price; DROP TABLE tours", visibility: "hidden" }, true);
  assert.doesNotMatch(query.sql, /DROP/);
  assert.match(query.sql, /active = \?/);
  assert.deepEqual(query.values, [false]);
});

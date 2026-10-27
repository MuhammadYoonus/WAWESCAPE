import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeTourPackages, tourToPackage } from "../src/data/tourPackages.js";

const tour = {
  _id: "42", slug: "ella-two", title: "Ella Mountain Escape", location: "Ella",
  duration: "2 Days", price: 18500.5, maxGuests: 6, image: "https://example.com/ella.jpg",
  description: "Explore Ella", shortDescription: "Mountain views",
  itinerary: [{ activities: ["Hotel pickup", "Guided walk"] }, { activities: ["Return transfer"] }]
};

test("database tours retain a distinct booking ID, numeric price and full itinerary", () => {
  const pkg = tourToPackage(tour);
  assert.equal(pkg.id, "tour-42");
  assert.equal(pkg.days, 2);
  assert.equal(pkg.basePrice, 18500.5);
  assert.equal(pkg.price, "LKR 18,500.50");
  assert.equal(pkg.maxGuests, 6);
  assert.deepEqual(pkg.plan, ["Hotel pickup", "Guided walk", "Return transfer"]);
  assert.equal(tourToPackage({ ...tour, duration: "Short tour" }).days, "short");
});

test("saved tours override matching starter packages while preserving the others", () => {
  const merged = mergeTourPackages([tour], [{ id: "ella-two", title: "Old title" }, { id: "galle-fort", title: "Galle" }]);
  assert.deepEqual(merged.map(pkg => pkg.title), ["Ella Mountain Escape", "Galle"]);
});

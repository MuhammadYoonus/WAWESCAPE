import assert from "node:assert/strict";
import { test } from "node:test";
import { tourToPackage } from "../src/data/tourPackages.js";

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

test("bundled images resolve through the API while external images are unchanged", () => {
  assert.equal(tourToPackage(tour).image, "https://example.com/ella.jpg");
  assert.equal(tourToPackage({ ...tour, image: "/tour-images/Ella.png" }).image, "http://localhost:5001/tour-images/Ella.png");
});

import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../src/db.js";
import tourRoutes from "../src/routes/tourRoutes.js";
import { errorHandler } from "../src/middleware/errors.js";

// These tests exercise HTTP routes against an isolated in-memory query stub.
// No project database records are read or changed, and no notifications are sent.
process.env.JWT_SECRET = "tour-publishing-test-secret";
process.env.SMTP_HOST = "";
process.env.SMTP_USER = "";
process.env.TWILIO_ACCOUNT_SID = "";
const { default: packageBookingRoutes } = await import("../src/routes/packageBookingRoutes.js");
const { default: bookingRoutes } = await import("../src/routes/bookingRoutes.js");
const originalQuery = pool.query;
const originalGetConnection = pool.getConnection;
let queryHandler;
let server;
let baseUrl;
let rows;
let queryCount;
const adminToken = jwt.sign({ id: "17", role: "admin" }, process.env.JWT_SECRET);
const customerToken = jwt.sign({ id: "18", role: "customer" }, process.env.JWT_SECRET);
const validTour = {
  title: "  Ella Mountain Escape  ", location: "Ella - Nine Arch Bridge", duration: "2 Days",
  category: "multi-day", price: 18500.50, maxGuests: 6,
  image: "https://example.com/ella.jpg", shortDescription: "A mountain getaway.",
  description: "Explore Ella with a local guide.",
  itinerary: [{ day: "Tour plan", title: "2 Days", activities: ["Hotel pickup", "Guided walk"] }]
};

before(async () => {
  pool.query = async (...args) => { queryCount++; return queryHandler(...args); };
  pool.getConnection = async () => ({ query: pool.query, beginTransaction: async () => {}, commit: async () => {}, rollback: async () => {}, release() {} });
  const app = express();
  app.use(express.json());
  app.use("/api/tours", tourRoutes);
  app.use("/api/package-bookings", packageBookingRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use(errorHandler);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

beforeEach(() => {
  rows = [];
  queryCount = 0;
  queryHandler = async (sql, values = []) => {
    if (sql.includes("INSERT INTO tours")) {
      const [title, slug, category, location, duration, price, max_guests, image,
        short_description, description, itinerary, includes, excludes, featured, active] = values;
      rows.push({ id: 42, title, slug, category, location, duration, price, max_guests,
        image, short_description, description, itinerary, includes, excludes, featured, active });
      return [{ insertId: 42 }];
    }
    if (sql.includes("FROM tours")) return [values.length ? rows.filter(row => String(row.id) === String(values[0])) : rows];
    throw new Error(`Unexpected query: ${sql}`);
  };
});

after(async () => {
  pool.query = originalQuery;
  pool.getConnection = originalGetConnection;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await pool.end();
});

async function post(path, body, token = adminToken) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
}

test("only an authenticated admin can publish a tour", async () => {
  assert.equal((await post("/tours", validTour, null)).status, 401);
  assert.equal((await post("/tours", validTour, customerToken)).status, 403);
  assert.equal(queryCount, 0);
});

test("publishing persists normalized fields and exposes the same tour through public reads", async () => {
  const response = await post("/tours", validTour);
  assert.equal(response.status, 201);
  const saved = await response.json();
  assert.equal(saved.title, "Ella Mountain Escape");
  assert.equal(saved.slug, "ella-mountain-escape");
  assert.equal(saved.price, 18500.5);
  assert.equal(saved.active, true);
  assert.deepEqual(saved.itinerary[0].activities, ["Hotel pickup", "Guided walk"]);
  assert.equal(rows.length, 1);
  const listed = await (await fetch(`${baseUrl}/tours`)).json();
  assert.equal(listed[0]._id, saved._id);
  const detail = await (await fetch(`${baseUrl}/tours/42`)).json();
  assert.equal(detail.title, saved.title);
});

test("invalid tour fields are rejected before any database write", async () => {
  for (const change of [
    { title: "   " }, { location: "" }, { price: -1 }, { price: "not-a-price" },
    { maxGuests: 1.5 }, { image: "javascript:alert(1)" }, { category: "unknown" },
    { itinerary: [] }, { itinerary: [{ day: "Day 1", title: "Walk", activities: [] }] }
  ]) {
    const response = await post("/tours", { ...validTour, ...change });
    assert.equal(response.status, 400, JSON.stringify(change));
    assert.ok((await response.json()).message);
  }
  assert.equal(queryCount, 0);
});

test("a duplicate slug returns an actionable error without exposing SQL", async () => {
  queryHandler = async () => { throw Object.assign(new Error("private SQL detail"), { code: "ER_DUP_ENTRY" }); };
  const response = await post("/tours", validTour);
  assert.equal(response.status, 409);
  const { message } = await response.json();
  assert.match(message, /already exists/);
  assert.doesNotMatch(message, /private SQL detail/);
});

async function createTour() {
  assert.equal((await post("/tours", validTour)).status, 201);
}

const bookingInput = {
  packageId: "tour-42", packageTitle: "Tampered title", packagePrice: "LKR 1",
  packageRoute: "Tampered route", bookingDate: "2027-01-01", adults: 2, children: 1, infants: 1,
  pickupLocation: "Test hotel", contactName: "Test customer", contactEmail: "test@example.invalid",
  contactPhone: "+94000000000"
};

test("published-tour bookings use the database price, title, route and capacity", async () => {
  await createTour();
  const readTour = queryHandler;
  let inserted;
  queryHandler = async (sql, values) => {
    if (sql.includes("INSERT INTO package_bookings")) { inserted = values; return [{ insertId: 99 }]; }
    if (sql.includes("FROM package_bookings")) {
      return [[{ id: 99, package_id: "tour-42", package_title: inserted[2], total_amount: inserted[15], guests: inserted[6], status: "pending" }]];
    }
    return readTour(sql, values);
  };
  const response = await post("/package-bookings", bookingInput, customerToken);
  assert.equal(response.status, 201);
  assert.equal(inserted[2], "Ella Mountain Escape");
  assert.equal(inserted[3], validTour.location);
  assert.equal(inserted[4], "LKR 18500.50");
  assert.equal(inserted[15], 18500.5 * 2.75);
});

test("over-capacity, negative and fractional guest counts cannot create published-tour bookings", async () => {
  await createTour();
  for (const change of [{ adults: 7 }, { children: -1 }, { infants: 0.5 }]) {
    const response = await post("/package-bookings", { ...bookingInput, ...change }, customerToken);
    assert.equal(response.status, 400);
  }
});

test("a removed published tour cannot be booked", async () => {
  const response = await post("/package-bookings", bookingInput, customerToken);
  assert.equal(response.status, 404);
});

test("tour bookings reference tours, persist special requests and reload the correct details", async () => {
  await createTour();
  const readTour = queryHandler;
  let inserted;
  queryHandler = async (sql, values) => {
    assert.doesNotMatch(sql, /JOIN trips/);
    if (sql.includes("INSERT INTO bookings")) {
      assert.match(sql, /tour_id, user_id/);
      assert.match(sql, /special_requests/);
      inserted = values;
      return [{ insertId: 100 }];
    }
    if (sql.includes("FROM bookings")) return [[{
      id: 100, tour_id: 42, tour_title: "Ella Mountain Escape", user_id: 18,
      guests: 2, total_price: inserted[7], special_requests: inserted[12], status: "pending"
    }]];
    return readTour(sql, values);
  };
  const response = await post("/bookings", {
    tourId: 42, bookingDate: "2027-01-01", adults: 2, children: 0, infants: 0,
    contactPhone: "+94770000000", pickupLocation: "Test hotel", specialRequests: "Vegetarian lunch"
  }, customerToken);
  assert.equal(response.status, 201);
  assert.equal(inserted[0], "42");
  assert.equal(inserted[1], "18");
  assert.equal((await response.json()).specialRequests, "Vegetarian lunch");
  const reloaded = await fetch(`${baseUrl}/bookings/mine`, { headers: { Authorization: `Bearer ${customerToken}` } });
  const items = await reloaded.json();
  assert.equal(items[0].tour.title, "Ella Mountain Escape");
  assert.equal(items[0].specialRequests, "Vegetarian lunch");
});

test("editing a tour changes the same public record and retains its identity", async () => {
  await createTour();
  const read = queryHandler;
  queryHandler = async (sql, values) => {
    if (sql.includes("UPDATE tours SET")) {
      rows[0].title = values[0]; rows[0].price = values[5];
      return [{ affectedRows: 1 }];
    }
    return read(sql, values);
  };
  const response = await fetch(`${baseUrl}/tours/42`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ ...validTour, title: "Updated Ella Tour", slug: "ella-mountain-escape", price: 21000 }) });
  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated._id, "42"); assert.equal(updated.title, "Updated Ella Tour"); assert.equal(updated.price, 21000);
});

test("deletion protects booked tours and removes only an unbooked record", async () => {
  await createTour();
  const read = queryHandler;
  let booked = 1;
  queryHandler = async (sql, values) => {
    if (sql.includes("SELECT id FROM tours")) return [[{ id: 42 }]];
    if (sql.includes("AS total")) return [[{ total: booked }]];
    if (sql.includes("DELETE FROM tours")) { rows = []; return [{ affectedRows: 1 }]; }
    return read(sql, values);
  };
  const request = () => fetch(`${baseUrl}/tours/42`, { method: "DELETE", headers: { Authorization: `Bearer ${adminToken}` } });
  assert.equal((await request()).status, 409);
  assert.equal(rows.length, 1);
  booked = 0;
  assert.equal((await request()).status, 200);
  assert.equal(rows.length, 0);
});

test("the management list requires admin access", async () => {
  const response = await fetch(`${baseUrl}/tours?admin=true`, { headers: { Authorization: `Bearer ${customerToken}` } });
  assert.equal(response.status, 403);
});

test("failed asynchronous database reads return JSON errors without crashing the API", async () => {
  queryHandler = async () => { throw Object.assign(new Error("private SQL and credentials"), { code: "TEST_DB_FAILURE" }); };
  const response = await fetch(`${baseUrl}/bookings/mine`, { headers: { Authorization: `Bearer ${customerToken}` } });
  assert.equal(response.status, 500);
  assert.doesNotMatch((await response.json()).message, /private|credentials|SQL/);
  const invalidStatus = await fetch(`${baseUrl}/bookings/42/status`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ status: "invalid" }) });
  assert.equal(invalidStatus.status, 400);
});

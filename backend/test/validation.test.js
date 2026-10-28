import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingInput, choice, email, integer, passwordText, phone, travelDate } from "../src/utils/validation.js";

test("travel dates reject past dates and impossible calendar dates", () => {
  assert.throws(() => travelDate("2026-10-27", "2026-10-28"), /past/);
  assert.throws(() => travelDate("2027-02-30", "2026-10-28"), /valid/);
  assert.equal(travelDate("2026-10-28", "2026-10-28"), "2026-10-28");
});
test("contact details and whole-number guest counts cannot bypass validation", () => {
  for (const value of ["not-email", "a@b", " "]) assert.throws(() => email(value));
  assert.equal(email(" TEST@Example.com "), "test@example.com");
  assert.throws(() => phone("not a number"));
  for (const value of [-1, 1.5, NaN, true, [], ""]) assert.throws(() => integer(value, "Guests"));
  assert.throws(() => choice("not-a-status", ["pending"], "Status"));
  assert.equal(passwordText(" password with spaces "), " password with spaces ");
});
test("guest capacity includes children and infants", () => {
  assert.throws(() => bookingInput({ adults: 2, children: 2, infants: 1 }, 4), /maximum of 4/);
});

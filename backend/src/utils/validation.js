export class ValidationError extends Error {}

export function text(value, label, max = 180, optional = false) {
  if (optional && (value == null || value === "")) return "";
  if (typeof value !== "string" || !value.trim()) throw new ValidationError(`${label} is required`);
  const result = value.trim();
  if (result.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer`);
  return result;
}
export function email(value, optional = false) {
  const result = text(value, "Email", 180, optional).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new ValidationError("Enter a valid email address");
  return result;
}
export function phone(value) {
  const result = text(value, "Phone number", 40);
  const digits = result.replace(/\D/g, "");
  if (!/^\+?[\d\s().-]+$/.test(result) || digits.length < 7 || digits.length > 15) throw new ValidationError("Enter a valid phone number with 7 to 15 digits");
  return result;
}
export function passwordText(value) {
  if (typeof value !== "string" || !value.length || Buffer.byteLength(value, "utf8") > 72) throw new ValidationError("Enter a password of no more than 72 bytes");
  return value;
}
export function integer(value, label, min = 0, max = 1000) {
  if (!["string", "number"].includes(typeof value) || String(value).trim() === "" || !Number.isSafeInteger(Number(value)) || Number(value) < min || Number(value) > max) {
    throw new ValidationError(`${label} must be a whole number between ${min} and ${max}`);
  }
  return Number(value);
}
export function resourceId(value) { return integer(value, "Record ID", 1, 2147483647); }
export function choice(value, allowed, label) {
  if (!allowed.includes(value)) throw new ValidationError(`Choose a valid ${label.toLowerCase()}`);
  return value;
}
export function travelDate(value, today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(new Date())) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ValidationError("Choose a valid travel date");
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new ValidationError("Choose a valid travel date");
  if (value < today) throw new ValidationError("Travel date cannot be in the past");
  return value;
}
export function bookingInput(body, maxGuests) {
  const adults = integer(body.adults, "Adults", 1);
  const children = integer(body.children ?? 0, "Children");
  const infants = integer(body.infants ?? 0, "Infants");
  const guests = adults + children + infants;
  if (guests > maxGuests) throw new ValidationError(`This tour allows a maximum of ${maxGuests} guests`);
  return { adults, children, infants, guests, bookingDate: travelDate(body.bookingDate),
    contactPhone: phone(body.contactPhone), pickupLocation: text(body.pickupLocation, "Pickup location", 255),
    specialRequests: text(body.specialRequests, "Special requests", 2000, true) };
}

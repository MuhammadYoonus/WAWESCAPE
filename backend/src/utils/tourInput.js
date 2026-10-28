import { randomUUID } from "node:crypto";

export class TourValidationError extends Error {}

function requiredText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TourValidationError(`${label} is required`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new TourValidationError(`${label} must be ${maxLength} characters or fewer`);
  }
  return text;
}

function stringList(value, label) {
  if (!Array.isArray(value) || value.length > 100) {
    throw new TourValidationError(`${label} must contain no more than 100 items`);
  }
  return value.map(item => requiredText(item, label, 500));
}

export function normalizeTourInput(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new TourValidationError("Enter the tour details");
  const title = requiredText(body.title, "Tour name", 180);
  const generatedSlug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = requiredText(body.slug ?? (generatedSlug || `tour-${randomUUID()}`), "Tour link", 180);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new TourValidationError("Tour link must use lowercase letters, numbers and hyphens");
  }
  if (!["day-tour", "multi-day", "round-tour", "experience"].includes(body.category)) {
    throw new TourValidationError("Choose a valid tour category");
  }
  const location = requiredText(body.location, "Route or location", 180);
  const duration = requiredText(body.duration, "Duration", 80);
  const price = Number(body.price);
  if (body.price === "" || !Number.isFinite(price) || price <= 0 || price > 99999999.99) {
    throw new TourValidationError("Price must be greater than zero and no more than LKR 99,999,999.99");
  }
  const maxGuests = Number(body.maxGuests ?? 10);
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 1000) {
    throw new TourValidationError("Guest limit must be a whole number between 1 and 1,000");
  }
  const image = requiredText(body.image, "Image URL", 2048);
  try {
    const isBundledImage = /^\/tour-images\/[^/\\]+$/.test(image) && !image.includes("..");
    if (!isBundledImage && !["http:", "https:"].includes(new URL(image).protocol)) throw new Error();
  } catch {
    throw new TourValidationError("Enter a valid image URL starting with http:// or https://");
  }
  const shortDescription = requiredText(body.shortDescription, "Short description", 500);
  const description = requiredText(body.description, "Full description", 10000);
  if (!Array.isArray(body.itinerary) || !body.itinerary.length || body.itinerary.length > 30) {
    throw new TourValidationError("Add at least one itinerary activity (maximum 30 itinerary sections)");
  }
  const itinerary = body.itinerary.map(item => {
    const activities = stringList(item?.activities, "Itinerary activities");
    if (!activities.length) throw new TourValidationError("Each itinerary section needs at least one activity");
    return {
      day: requiredText(item?.day, "Itinerary day", 80),
      title: requiredText(item?.title, "Itinerary title", 180),
      activities
    };
  });

  return [
    title, slug, body.category, location, duration, Math.round(price * 100) / 100,
    maxGuests, image, shortDescription, description, JSON.stringify(itinerary),
    JSON.stringify(stringList(body.includes ?? [], "Included items")),
    JSON.stringify(stringList(body.excludes ?? [], "Excluded items")),
    body.featured === true, body.active !== false
  ];
}

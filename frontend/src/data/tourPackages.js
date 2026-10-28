import { tourImageUrl } from "../utils/tourImage.js";

export const packageOptions = [
  ["short", "Short Tours"],
  ["1", "1 Day"],
  ["2", "2 Days"],
  ["3", "3 Days"]
];

export function formatLkr(value) {
  const amount = Number(value);
  return `LKR ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

export function tourToPackage(tour) {
  const dayMatch = String(tour.duration).match(/^\s*(\d+)\s*days?\b/i);
  const days = dayMatch ? Number(dayMatch[1]) : "short";
  const plan = (tour.itinerary || []).flatMap(item => item.activities || []);
  return {
    id: `tour-${tour._id}`,
    tourId: tour._id,
    slug: tour.slug,
    days,
    title: tour.title,
    route: tour.location,
    price: formatLkr(tour.price),
    basePrice: Number(tour.price),
    maxGuests: tour.maxGuests,
    image: tourImageUrl(tour.image),
    description: tour.description,
    plan: plan.length ? plan : [tour.shortDescription]
  };
}

export function mergeTourPackages(tours, existingPackages) {
  const published = tours.map(tourToPackage);
  const publishedSlugs = new Set(tours.map(tour => tour.slug));
  return [...published, ...existingPackages.filter(pkg => !publishedSlugs.has(pkg.id))];
}

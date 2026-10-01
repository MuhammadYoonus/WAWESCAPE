import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { initDb, pool } from "./db.js";

dotenv.config();

const tours = [
  {
    title: "Mirissa Whale Watching Escape",
    slug: "mirissa-whale-watching",
    category: "experience",
    location: "Mirissa",
    duration: "1 Day",
    price: 8500,
    maxGuests: 8,
    image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "A morning ocean adventure to spot whales and dolphins.",
    description: "Enjoy a guided whale-watching experience from Mirissa with time to explore the southern coast.",
    itinerary: [{ day: "Day 1", title: "Ocean Adventure", activities: ["Hotel pickup", "Boat trip", "Whale and dolphin watching", "Lunch"] }],
    includes: ["Transport", "Boat ticket", "Guide", "Lunch"],
    excludes: ["Personal expenses"],
    featured: true
  },
  {
    title: "Yala National Park Safari",
    slug: "yala-safari",
    category: "experience",
    location: "Yala",
    duration: "1 Day",
    price: 12500,
    maxGuests: 6,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Explore Yala's wildlife on a guided jeep safari.",
    description: "Experience Sri Lanka's famous wildlife landscapes and look for elephants, leopards, crocodiles and birds.",
    itinerary: [{ day: "Day 1", title: "Yala Safari", activities: ["Pickup", "Morning safari", "Lunch", "Afternoon safari"] }],
    includes: ["Jeep", "Driver", "Park entrance", "Lunch"],
    excludes: ["Accommodation"],
    featured: true
  },
  {
    title: "Galle & Unawatuna Day Tour",
    slug: "galle-unawatuna-day-tour",
    category: "day-tour",
    location: "Galle / Unawatuna",
    duration: "1 Day",
    price: 9500,
    maxGuests: 10,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Discover the historic Galle Fort and beautiful Unawatuna beach.",
    description: "A relaxed southern Sri Lanka day tour combining heritage, beaches and local food.",
    itinerary: [{ day: "Day 1", title: "Southern Highlights", activities: ["Galle Fort", "Lunch", "Unawatuna Beach", "Return"] }],
    includes: ["Transport", "Guide", "Lunch"],
    excludes: ["Entry tickets"],
    featured: true
  }
];

async function seed() {
  await initDb();
  await pool.query("DELETE FROM bookings");
  await pool.query("DELETE FROM tours");

  for (const tour of tours) {
    await pool.query(
      `INSERT INTO tours
      (title, slug, category, location, duration, price, max_guests, image, short_description, description, itinerary, includes, excludes, featured, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [
        tour.title,
        tour.slug,
        tour.category,
        tour.location,
        tour.duration,
        tour.price,
        tour.maxGuests,
        tour.image,
        tour.shortDescription,
        tour.description,
        JSON.stringify(tour.itinerary),
        JSON.stringify(tour.includes),
        JSON.stringify(tour.excludes),
        Boolean(tour.featured)
      ]
    );
  }

  const email = "admin@wavecape.lk";
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (!existing.length) {
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["WAWECAPE Admin", email, await bcrypt.hash("Admin123!", 10), "admin"]
    );
  }

  console.log("MySQL database seeded successfully");
  await pool.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

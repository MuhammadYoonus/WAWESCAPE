import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Tour from "./models/Tour.js";

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
  },
  {
    title: "Classic Sri Lanka Round Tour",
    slug: "classic-sri-lanka-round-tour",
    category: "round-tour",
    location: "Colombo – Kandy – Ella – Yala – Galle",
    duration: "8 Days / 7 Nights",
    price: 145000,
    maxGuests: 10,
    image: "https://images.unsplash.com/photo-1586613830776-7f3f7c2f0d9f?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "An island-wide journey covering culture, mountains, wildlife and beaches.",
    description: "A complete Sri Lankan journey designed for visitors who want to see several regions in one trip.",
    itinerary: [
      { day: "Day 1", title: "Colombo", activities: ["Airport pickup", "City tour", "Hotel check-in"] },
      { day: "Day 2", title: "Kandy", activities: ["Temple of the Tooth", "Cultural show"] },
      { day: "Day 3", title: "Nuwara Eliya", activities: ["Tea plantation", "Waterfalls"] },
      { day: "Day 4", title: "Ella", activities: ["Scenic train journey", "Ella town"] },
      { day: "Day 5", title: "Ella", activities: ["Little Adam's Peak", "Nine Arch Bridge"] },
      { day: "Day 6", title: "Yala", activities: ["Wildlife safari"] },
      { day: "Day 7", title: "Galle", activities: ["South coast", "Galle Fort"] },
      { day: "Day 8", title: "Departure", activities: ["Transfer to airport"] }
    ],
    includes: ["Accommodation", "Transport", "Selected meals", "Guide"],
    excludes: ["Flights", "Personal expenses"],
    featured: true
  },
  {
    title: "Bentota Turtle & River Adventure",
    slug: "bentota-turtle-river",
    category: "day-tour",
    location: "Bentota",
    duration: "1 Day",
    price: 7500,
    maxGuests: 10,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Visit turtle conservation attractions and cruise through Bentota's waterways.",
    description: "A family-friendly coastal experience featuring nature, waterways and a relaxed beach atmosphere.",
    itinerary: [{ day: "Day 1", title: "Bentota", activities: ["Turtle conservation visit", "River safari", "Beach time"] }],
    includes: ["Transport", "Guide", "River boat"],
    excludes: ["Lunch", "Personal expenses"]
  },
  {
    title: "Kandy – Ella Mountain Journey",
    slug: "kandy-ella-mountain",
    category: "multi-day",
    location: "Kandy / Nuwara Eliya / Ella",
    duration: "3 Days / 2 Nights",
    price: 52000,
    maxGuests: 8,
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "A compact mountain escape through tea country and Ella.",
    description: "Travel from cultural Kandy into the cool highlands and scenic Ella.",
    itinerary: [
      { day: "Day 1", title: "Kandy", activities: ["City tour", "Temple visit"] },
      { day: "Day 2", title: "Tea Country", activities: ["Tea factory", "Train journey"] },
      { day: "Day 3", title: "Ella", activities: ["Nine Arch Bridge", "Return transfer"] }
    ],
    includes: ["Transport", "2 nights accommodation", "Breakfast", "Guide"],
    excludes: ["Train class upgrades", "Personal expenses"]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Tour.deleteMany({});
  await Tour.insertMany(tours);

  const email = "admin@wavecape.lk";
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: "WAWECAPE Admin",
      email,
      password: await bcrypt.hash("Admin123!", 10),
      role: "admin"
    });
  }

  console.log("Database seeded successfully");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

import mongoose from "mongoose";

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ["day-tour", "multi-day", "round-tour", "experience"],
    required: true
  },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  maxGuests: { type: Number, default: 10 },
  image: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  itinerary: [{ day: String, title: String, activities: [String] }],
  includes: [String],
  excludes: [String],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Tour", tourSchema);

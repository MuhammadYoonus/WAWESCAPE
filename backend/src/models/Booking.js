import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  bookingDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  contactPhone: { type: String, required: true },
  specialRequests: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);

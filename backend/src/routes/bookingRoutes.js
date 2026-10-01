import express from "express";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { tourId, bookingDate, guests, contactPhone, specialRequests } = req.body;
    const tour = await Tour.findById(tourId);
    if (!tour || !tour.active) return res.status(404).json({ message: "Tour not available" });
    if (guests < 1 || guests > tour.maxGuests) {
      return res.status(400).json({ message: `Guests must be between 1 and ${tour.maxGuests}` });
    }

    const booking = await Booking.create({
      user: req.user.id,
      tour: tour._id,
      bookingDate,
      guests,
      totalPrice: tour.price * guests,
      contactPhone,
      specialRequests
    });

    const populated = await booking.populate("tour");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("tour", "title location duration image price")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.get("/", protect, adminOnly, async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("tour", "title location")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

export default router;

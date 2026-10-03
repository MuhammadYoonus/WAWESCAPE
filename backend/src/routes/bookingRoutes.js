import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapBooking, mapTour, pool } from "../db.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { tourId, bookingDate, adults, children, infants, pickupLocation, contactPhone, specialRequests } = req.body;
    const adultCount = Number(adults || 0);
    const childCount = Number(children || 0);
    const infantCount = Number(infants || 0);
    const guestCount = adultCount + childCount + infantCount;

    const [tourRows] = await pool.query("SELECT * FROM tours WHERE id = ?", [tourId]);
    const tour = mapTour(tourRows[0]);
    if (!tour || !tour.active) return res.status(404).json({ message: "Tour not available" });
    if (adultCount < 1) {
      return res.status(400).json({ message: "At least one adult is required for a booking" });
    }
    if (guestCount < 1 || guestCount > tour.maxGuests) {
      return res.status(400).json({ message: `Guests must be between 1 and ${tour.maxGuests}` });
    }

    const chargeableGuests = adultCount + childCount * 0.75;
    const [result] = await pool.query(
      `INSERT INTO bookings
      (trip_id, customer_name, email, phone, travelers, travel_date, total_amount, status, pickup_location, adults, children, infants)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        tour._id,
        req.user.name,
        req.user.email,
        contactPhone,
        guestCount,
        bookingDate,
        tour.price * chargeableGuests,
        pickupLocation,
        adultCount,
        childCount,
        infantCount
      ]
    );

    const [rows] = await pool.query(bookingJoinQuery("WHERE b.id = ?"), [result.insertId]);
    const booking = mapBooking(rows[0]);
    booking.specialRequests = specialRequests || "";
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  const [rows] = await pool.query(bookingJoinQuery("WHERE b.email = ? ORDER BY b.created_at DESC"), [req.user.email]);
  res.json(rows.map(mapBooking));
});

router.get("/", protect, adminOnly, async (req, res) => {
  const [rows] = await pool.query(bookingJoinQuery("ORDER BY b.created_at DESC"));
  res.json(rows.map(mapBooking));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
  const [rows] = await pool.query(bookingJoinQuery("WHERE b.id = ?"), [req.params.id]);
  const booking = mapBooking(rows[0]);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

function bookingJoinQuery(suffix = "") {
  return `
    SELECT
      b.*,
      tr.id AS trip_id,
      COALESCE(tr.title, CONCAT('Trip #', b.trip_id)) AS trip_title,
      tr.location AS trip_location,
      tr.duration AS trip_duration,
      tr.image_url AS trip_image,
      tr.price AS trip_price
    FROM bookings b
    LEFT JOIN trips tr ON b.trip_id = tr.id
    ${suffix}
  `;
}

export default router;

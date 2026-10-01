import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapBooking, mapTour, pool } from "../db.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { tourId, bookingDate, guests, contactPhone, specialRequests } = req.body;
    const [tourRows] = await pool.query("SELECT * FROM tours WHERE id = ?", [tourId]);
    const tour = mapTour(tourRows[0]);
    if (!tour || !tour.active) return res.status(404).json({ message: "Tour not available" });
    if (guests < 1 || guests > tour.maxGuests) {
      return res.status(400).json({ message: `Guests must be between 1 and ${tour.maxGuests}` });
    }

    const [result] = await pool.query(
      `INSERT INTO bookings
      (user_id, tour_id, booking_date, guests, total_price, contact_phone, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, tour._id, bookingDate, guests, tour.price * guests, contactPhone, specialRequests || ""]
    );

    const [rows] = await pool.query(bookingJoinQuery("WHERE b.id = ?"), [result.insertId]);
    res.status(201).json(mapBooking(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  const [rows] = await pool.query(bookingJoinQuery("WHERE b.user_id = ? ORDER BY b.created_at DESC"), [req.user.id]);
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
      t.id AS tour_id,
      t.title AS tour_title,
      t.location AS tour_location,
      t.duration AS tour_duration,
      t.image AS tour_image,
      t.price AS tour_price,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    JOIN users u ON b.user_id = u.id
    ${suffix}
  `;
}

export default router;

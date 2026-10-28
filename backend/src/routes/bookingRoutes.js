import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapBooking, mapTour, pool } from "../db.js";
import { sendBookingConfirmation } from "../services/notificationService.js";
import { bookingInput, choice, resourceId, ValidationError } from "../utils/validation.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const tourId = resourceId(req.body?.tourId);

    const [tourRows] = await pool.query("SELECT * FROM tours WHERE id = ?", [tourId]);
    const tour = mapTour(tourRows[0]);
    if (!tour || !tour.active) return res.status(404).json({ message: "Tour not available" });
    const { adults: adultCount, children: childCount, infants: infantCount, guests: guestCount,
      bookingDate, pickupLocation, contactPhone, specialRequests } = bookingInput(req.body, tour.maxGuests);

    const chargeableGuests = adultCount + childCount * 0.75;
    const [result] = await pool.query(
      `INSERT INTO bookings
      (tour_id, user_id, customer_name, email, contact_phone, guests, booking_date, total_price, status, pickup_location, adults, children, infants, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        tour._id,
        req.user.id,
        req.user.name,
        req.user.email,
        contactPhone,
        guestCount,
        bookingDate,
        tour.price * chargeableGuests,
        pickupLocation,
        adultCount,
        childCount,
        infantCount,
        specialRequests || ""
      ]
    );

    const [rows] = await pool.query(bookingJoinQuery("WHERE b.id = ?"), [result.insertId]);
    const booking = mapBooking(rows[0]);
    sendBookingConfirmation(booking, { kind: "tour" }).catch(error => {
      console.error("Booking notification failed:", error.message);
    });
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

router.get("/mine", protect, async (req, res) => {
  const [rows] = await pool.query(bookingJoinQuery("WHERE (b.user_id = ? OR (b.user_id IS NULL AND b.email = ?)) ORDER BY b.created_at DESC"), [req.user.id, req.user.email]);
  res.json(rows.map(mapBooking));
});

router.get("/", protect, adminOnly, async (req, res) => {
  const [rows] = await pool.query(bookingJoinQuery("ORDER BY b.created_at DESC"));
  res.json(rows.map(mapBooking));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const status = choice(req.body?.status, ["pending", "confirmed", "cancelled", "completed"], "Booking status");
  await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);
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
      COALESCE(t.title, 'Unavailable tour') AS tour_title,
      t.location AS tour_location,
      t.duration AS tour_duration,
      t.image AS tour_image,
      t.price AS tour_price,
      COALESCE(u.name, b.customer_name) AS user_name,
      COALESCE(u.email, b.email) AS user_email
    FROM bookings b
    LEFT JOIN tours t ON b.tour_id = t.id
    LEFT JOIN users u ON b.user_id = u.id
    ${suffix}
  `;
}

export default handleRouteErrors(router);

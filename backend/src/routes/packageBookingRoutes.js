import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapPackageBooking, mapTour, pool } from "../db.js";
import { sendBookingConfirmation } from "../services/notificationService.js";
import { bookingInput, choice, email, resourceId, text, ValidationError } from "../utils/validation.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const packageId = text(req.body?.packageId, "Package", 120);
    const byId = packageId.startsWith("tour-");
    const lookup = byId ? resourceId(packageId.slice(5)) : packageId;
    const [tourRows] = await pool.query(`SELECT * FROM tours WHERE ${byId ? "id" : "slug"} = ? AND active = true`, [lookup]);
    const tour = mapTour(tourRows[0]);
    if (!tour) return res.status(404).json({ message: "Tour package is no longer available" });
    const { adults: adultCount, children: childCount, infants: infantCount, guests: guestCount,
      bookingDate, pickupLocation, contactPhone, specialRequests } = bookingInput(req.body, tour.maxGuests);
    const contactName = text(req.body.contactName, "Contact name", 120);
    const contactEmail = email(req.body.contactEmail);
    const { title, location: route, price: basePrice, _id: tourId } = tour;
    const price = `LKR ${basePrice.toFixed(2)}`;
    const chargeableGuests = adultCount + childCount * 0.75;

    const [result] = await pool.query(
      `INSERT INTO package_bookings
      (user_id, package_id, package_title, package_route, package_price, booking_date, guests, contact_name, contact_email, contact_phone, special_requests, pickup_location, adults, children, infants, total_amount, tour_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        packageId,
        title,
        route || "",
        price || "",
        bookingDate,
        guestCount,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests || "",
        pickupLocation,
        adultCount,
        childCount,
        infantCount,
        basePrice ? basePrice * chargeableGuests : null,
        tourId
      ]
    );

    const [rows] = await pool.query(packageBookingJoinQuery("WHERE pb.id = ?"), [result.insertId]);
    const booking = mapPackageBooking(rows[0]);
    sendBookingConfirmation(booking, { kind: "package" }).catch(error => {
      console.error("Booking notification failed:", error.message);
    });
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

router.get("/mine", protect, async (req, res) => {
  const [rows] = await pool.query(
    packageBookingJoinQuery("WHERE pb.user_id = ? ORDER BY pb.created_at DESC"),
    [req.user.id]
  );
  res.json(rows.map(mapPackageBooking));
});

router.get("/", protect, adminOnly, async (req, res) => {
  const [rows] = await pool.query(packageBookingJoinQuery("ORDER BY pb.created_at DESC"));
  res.json(rows.map(mapPackageBooking));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const status = choice(req.body?.status, ["pending", "confirmed", "cancelled", "completed"], "Booking status");
  await pool.query("UPDATE package_bookings SET status = ? WHERE id = ?", [status, req.params.id]);
  const [rows] = await pool.query(packageBookingJoinQuery("WHERE pb.id = ?"), [req.params.id]);
  const booking = mapPackageBooking(rows[0]);
  if (!booking) return res.status(404).json({ message: "Package booking not found" });
  res.json(booking);
});

function packageBookingJoinQuery(suffix = "") {
  return `
    SELECT
      pb.*,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email
    FROM package_bookings pb
    LEFT JOIN users u ON pb.user_id = u.id
    ${suffix}
  `;
}

export default handleRouteErrors(router);

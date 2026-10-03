import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapPackageBooking, pool } from "../db.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const {
      packageId,
      packageTitle,
      packageRoute,
      packagePrice,
      bookingDate,
      adults,
      children,
      infants,
      pickupLocation,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests
    } = req.body;
    const adultCount = Number(adults || 0);
    const childCount = Number(children || 0);
    const infantCount = Number(infants || 0);
    const guestCount = adultCount + childCount + infantCount;
    const basePrice = priceFromText(packagePrice);
    const chargeableGuests = adultCount + childCount * 0.75;

    if (!packageId || !packageTitle || !bookingDate || !contactName || !contactEmail || !contactPhone || !pickupLocation) {
      return res.status(400).json({ message: "Please complete all required booking details" });
    }

    if (adultCount < 1) {
      return res.status(400).json({ message: "At least one adult is required for a booking" });
    }

    const [result] = await pool.query(
      `INSERT INTO package_bookings
      (user_id, package_id, package_title, package_route, package_price, booking_date, guests, contact_name, contact_email, contact_phone, special_requests, pickup_location, adults, children, infants, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        packageId,
        packageTitle,
        packageRoute || "",
        packagePrice || "",
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
        basePrice ? basePrice * chargeableGuests : null
      ]
    );

    const [rows] = await pool.query(packageBookingJoinQuery("WHERE pb.id = ?"), [result.insertId]);
    res.status(201).json(mapPackageBooking(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  await pool.query("UPDATE package_bookings SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
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

function priceFromText(value = "") {
  const number = String(value).replace(/[^\d.]/g, "");
  return number ? Number(number) : 0;
}

export default router;

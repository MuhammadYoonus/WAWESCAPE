import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapTour, pool } from "../db.js";
import { normalizeTourInput, TourValidationError } from "../utils/tourInput.js";
import { buildTourQuery } from "../utils/tourQuery.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  if (req.query.admin === "true") return protect(req, res, () => adminOnly(req, res, next));
  next();
}, async (req, res) => {
  try {
    const { sql, values } = buildTourQuery(req.query, req.query.admin === "true");
    const [rows] = await pool.query(sql, values);
    res.json(rows.map(mapTour));
  } catch (error) {
    throw error;
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tours WHERE slug = ? AND active = true", [req.params.slug]);
    if (!rows.length) return res.status(404).json({ message: "Tour not found" });
    res.json(mapTour(rows[0]));
  } catch (error) { res.status(500).json({ message: "Unable to load tour" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ? AND active = true", [req.params.id]);
    const tour = mapTour(rows[0]);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    throw error;
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const data = normalizeTourInput(req.body);
    const [result] = await pool.query(
      `INSERT INTO tours
      (title, slug, category, location, duration, price, max_guests, image, short_description, description, itinerary, includes, excludes, featured, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data
    );
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [result.insertId]);
    const tour = mapTour(rows[0]);
    res.status(201).json(tour);
  } catch (error) {
    respondToSaveError(res, error);
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const data = normalizeTourInput(req.body);
    const [result] = await pool.query(
      `UPDATE tours SET
      title = ?, slug = ?, category = ?, location = ?, duration = ?, price = ?, max_guests = ?,
      image = ?, short_description = ?, description = ?, itinerary = ?, includes = ?, excludes = ?,
      featured = ?, active = ?
      WHERE id = ?`,
      [...data, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Tour not found" });
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [req.params.id]);
    const tour = mapTour(rows[0]);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    respondToSaveError(res, error);
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT id FROM tours WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Tour not found" });
    }
    const [booked] = await connection.query(`SELECT
      (SELECT COUNT(*) FROM bookings WHERE tour_id = ?) +
      (SELECT COUNT(*) FROM package_bookings WHERE tour_id = ?) AS total`, [req.params.id, req.params.id]);
    if (booked[0].total > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "This tour has bookings and cannot be deleted. Edit it and turn off visibility to stop new bookings while preserving its history." });
    }
    await connection.query("DELETE FROM tours WHERE id = ?", [req.params.id]);
    await connection.commit();
    res.json({ message: "Tour deleted" });
  } catch (error) {
    await connection?.rollback();
    res.status(error.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500).json({ message: "Unable to delete this tour. It may have an existing booking." });
  } finally { connection?.release(); }
});

function respondToSaveError(res, error) {
  if (error instanceof TourValidationError) {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "A tour with this name or link already exists. Please use a different tour name." });
  }
  console.error("Unable to save tour:", error.message);
  return res.status(500).json({ message: "Unable to save the tour. Please try again." });
}

export default handleRouteErrors(router);

import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { mapTour, pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const where = ["active = true"];
    const values = [];

    if (req.query.category && req.query.category !== "all") {
      where.push("category = ?");
      values.push(req.query.category);
    }

    if (req.query.featured === "true") {
      where.push("featured = true");
    }

    const [rows] = await pool.query(
      `SELECT * FROM tours WHERE ${where.join(" AND ")} ORDER BY featured DESC, created_at DESC`,
      values
    );
    res.json(rows.map(mapTour));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [req.params.id]);
    const tour = mapTour(rows[0]);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM tours WHERE id = ?", [req.params.id]);
    res.json({ message: "Tour deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function normalizeTourInput(body) {
  return [
    body.title,
    body.slug,
    body.category,
    body.location,
    body.duration,
    Number(body.price),
    Number(body.maxGuests || 10),
    body.image,
    body.shortDescription,
    body.description,
    JSON.stringify(body.itinerary || []),
    JSON.stringify(body.includes || []),
    JSON.stringify(body.excludes || []),
    Boolean(body.featured),
    body.active !== false
  ];
}

export default router;

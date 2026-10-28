import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { mapFeedback, pool } from "../db.js";
import { choice, email as validateEmail, integer, text as validateText, ValidationError } from "../utils/validation.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const name = validateText(req.body?.name, "Name", 120);
    const email = validateEmail(req.body?.email, true);
    const trip = validateText(req.body?.trip, "Trip", 180);
    const text = validateText(req.body?.text, "Feedback", 4000);
    const numericRating = integer(req.body?.rating, "Rating", 1, 5);

    const [result] = await pool.query(
      "INSERT INTO feedback (name, email, trip, rating, message) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email?.trim().toLowerCase() || null, trip.trim(), numericRating, text.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM feedback WHERE id = ?", [result.insertId]);
    res.status(201).json(mapFeedback(rows[0]));
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

router.get("/", (req, res, next) => {
  if (req.query.admin === "true") return protect(req, res, () => adminOnly(req, res, next));
  next();
}, async (req, res) => {
  const adminView = req.query.admin === "true";
  const [rows] = await pool.query(adminView ? "SELECT * FROM feedback ORDER BY created_at DESC" : "SELECT * FROM feedback WHERE status <> 'hidden' ORDER BY created_at DESC LIMIT 12");
  res.json(rows.map(row => { const item = mapFeedback(row); if (!adminView) delete item.email; return item; }));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const status = choice(req.body?.status, ["new", "reviewed", "hidden"], "Feedback status");
  await pool.query("UPDATE feedback SET status = ? WHERE id = ?", [status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM feedback WHERE id = ?", [req.params.id]);
  const feedback = mapFeedback(rows[0]);
  if (!feedback) return res.status(404).json({ message: "Feedback not found" });
  res.json(feedback);
});

export default handleRouteErrors(router);

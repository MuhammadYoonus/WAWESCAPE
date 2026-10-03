import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { mapFeedback, pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, trip, rating, text } = req.body;
    const numericRating = Number(rating);

    if (!name || !trip || !text || !numericRating) {
      return res.status(400).json({ message: "Please complete all feedback fields" });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [result] = await pool.query(
      "INSERT INTO feedback (name, email, trip, rating, message) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email?.trim().toLowerCase() || null, trip.trim(), numericRating, text.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM feedback WHERE id = ?", [result.insertId]);
    res.status(201).json(mapFeedback(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  const adminView = req.query.admin === "true";

  if (adminView) {
    return protect(req, res, () => adminOnly(req, res, async () => {
      const [rows] = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");
      res.json(rows.map(mapFeedback));
    }));
  }

  const [rows] = await pool.query(
    "SELECT * FROM feedback WHERE status <> 'hidden' ORDER BY created_at DESC LIMIT 12"
  );
  res.json(rows.map(mapFeedback));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  await pool.query("UPDATE feedback SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM feedback WHERE id = ?", [req.params.id]);
  const feedback = mapFeedback(rows[0]);
  if (!feedback) return res.status(404).json({ message: "Feedback not found" });
  res.json(feedback);
});

export default router;

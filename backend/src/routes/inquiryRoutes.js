import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { mapInquiry, pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, tourInterest, message } = req.body;

    if (!name || !email || !tourInterest || !message) {
      return res.status(400).json({ message: "Please complete all inquiry fields" });
    }

    const [result] = await pool.query(
      "INSERT INTO inquiries (name, email, tour_interest, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), tourInterest, message.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM inquiries WHERE id = ?", [result.insertId]);
    res.status(201).json(mapInquiry(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
  res.json(rows.map(mapInquiry));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  await pool.query("UPDATE inquiries SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM inquiries WHERE id = ?", [req.params.id]);
  const inquiry = mapInquiry(rows[0]);
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
  res.json(inquiry);
});

export default router;

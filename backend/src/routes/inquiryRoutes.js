import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { mapInquiry, pool } from "../db.js";
import { choice, email as validateEmail, text, ValidationError } from "../utils/validation.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const name = text(req.body?.name, "Name", 120);
    const email = validateEmail(req.body?.email);
    const tourInterest = text(req.body?.tourInterest, "Tour interest", 120);
    const message = text(req.body?.message, "Message", 4000);

    const [result] = await pool.query(
      "INSERT INTO inquiries (name, email, tour_interest, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), tourInterest, message.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM inquiries WHERE id = ?", [result.insertId]);
    res.status(201).json(mapInquiry(rows[0]));
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
  res.json(rows.map(mapInquiry));
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const status = choice(req.body?.status, ["new", "contacted", "closed"], "Inquiry status");
  await pool.query("UPDATE inquiries SET status = ? WHERE id = ?", [status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM inquiries WHERE id = ?", [req.params.id]);
  const inquiry = mapInquiry(rows[0]);
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
  res.json(inquiry);
});

export default handleRouteErrors(router);

import { handleRouteErrors } from "../middleware/errors.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mapUser, pool } from "../db.js";
import { email as validateEmail, passwordText, text, ValidationError } from "../utils/validation.js";

const router = express.Router();

function tokenFor(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const name = text(req.body?.name, "Full name", 120);
    const normalizedEmail = validateEmail(req.body?.email);
    const password = passwordText(req.body?.password);
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Password must be no more than 72 bytes" });

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashed]
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    const user = mapUser(rows[0]);

    res.status(201).json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = validateEmail(req.body?.email);
    const password = passwordText(req.body?.password);
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = mapUser(rows[0]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
    throw error;
  }
});

export default handleRouteErrors(router);

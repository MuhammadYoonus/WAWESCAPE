import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import packageBookingRoutes from "./routes/packageBookingRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { initDb } from "./db.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);
const localFrontendPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || localFrontendPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "WAWECAPE API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/package-bookings", packageBookingRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5001;

initDb()
  .then(() => {
    console.log("MySQL connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  });

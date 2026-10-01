import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "WAWECAPE API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

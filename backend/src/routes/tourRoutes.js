import express from "express";
import Tour from "../models/Tour.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category && req.query.category !== "all") filter.category = req.query.category;
    if (req.query.featured === "true") filter.featured = true;

    const tours = await Tour.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json(tour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: "Tour deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

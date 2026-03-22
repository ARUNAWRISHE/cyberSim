import express from "express";
import { getDashboardStats, getDetailedStats, resetLabProgress } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/detailed", protect, getDetailedStats);
router.post("/reset", protect, resetLabProgress);

export default router;

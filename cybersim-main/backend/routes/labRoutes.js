import express from "express";
import { getLabs, getLabBySlug, getLabProgress, startLab, executeLab, submitFlag, getHint, getLabLogs, seedLabs } from "../controllers/labController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getLabs);
router.get("/:slug", protect, getLabBySlug);
router.get("/progress/all", protect, getLabProgress);
router.get("/:labId/logs", protect, getLabLogs);

router.post("/start", protect, startLab);
router.post("/execute", protect, executeLab);
router.post("/submit", protect, submitFlag);
router.post("/hint", protect, getHint);
router.post("/seed", seedLabs);

export default router;

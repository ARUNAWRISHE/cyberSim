import express from "express";
import { protect } from "../middleware/auth.js";
import {
  executeDefense,
  completeDefense,
  checkAttackCompleted,
  getDefenseHint,
  getDefenseInfo
} from "../controllers/defenseController.js";

const router = express.Router();

router.get("/status/:labSlug", protect, checkAttackCompleted);

router.post("/execute", protect, executeDefense);

router.post("/complete", protect, completeDefense);

router.get("/info/:labSlug", protect, getDefenseInfo);

router.post("/hint", protect, getDefenseHint);

export default router;

import express from "express";
import { executeAttack, getHint, getPublicEndpoints } from "../controllers/attackController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/execute", protect, executeAttack);
router.post("/hint", protect, getHint);
router.get("/endpoints", getPublicEndpoints);

export default router;

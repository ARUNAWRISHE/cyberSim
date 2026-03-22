import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import attackRoutes from "./routes/attackRoutes.js";
import defenseRoutes from "./routes/defenseRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/attack", attackRoutes);
app.use("/api/defense", defenseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

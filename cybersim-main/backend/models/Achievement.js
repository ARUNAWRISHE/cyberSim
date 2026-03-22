import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badge: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: "🏆" },
  points: { type: Number, default: 50 },
  earnedAt: { type: Date, default: Date.now },
});

achievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);

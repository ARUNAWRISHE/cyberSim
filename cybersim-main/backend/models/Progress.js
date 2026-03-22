import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
  status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
  score: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAttempt: { type: Date },
});

progressSchema.index({ userId: 1, labId: 1 }, { unique: true });
progressSchema.index({ userId: 1 });

export default mongoose.model("Progress", progressSchema);

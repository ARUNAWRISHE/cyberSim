import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
  action: { type: String, enum: ["start", "attack", "defense", "hint", "submit"], required: true },
  input: { type: String, required: true },
  output: { type: String },
  success: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

logSchema.index({ userId: 1, labId: 1 });
logSchema.index({ labId: 1, timestamp: -1 });

export default mongoose.model("Log", logSchema);

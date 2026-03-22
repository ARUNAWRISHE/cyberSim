import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, enum: ["attack", "defense"], required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  description: { type: String, required: true },
  instructions: [{ step: Number, text: String }],
  flag: { type: String, required: true },
  points: { type: Number, default: 100 },
  hints: [{ type: String }],
  dockerImage: { type: String, default: null },
  dockerPort: { type: Number, default: null },
  vulnerableEndpoint: { type: String, default: null },
  secureEndpoint: { type: String, default: null },
  isDockerized: { type: Boolean, default: false },
  containerId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

labSchema.index({ slug: 1 });
labSchema.index({ category: 1 });

export default mongoose.model("Lab", labSchema);

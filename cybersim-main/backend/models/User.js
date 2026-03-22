import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achievement" }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export default mongoose.model("User", userSchema);

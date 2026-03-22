import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Achievement from "../models/Achievement.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    await Achievement.create({
      userId: user._id,
      badge: "first-steps",
      name: "First Steps",
      description: "Created your account",
      icon: "🎯",
      points: 10
    });

    user.points += 10;
    user.achievements.push(user._id);
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      achievements: user.achievements,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("achievements");

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      streak: user.streak,
      achievements: populatedUser.achievements,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("achievements");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const lastActive = user.lastActive?.toDateString();

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActive = new Date();
      await user.save();
    }

    res.json({ streak: user.streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("username points streak achievements")
      .populate("achievements")
      .sort({ points: -1 })
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

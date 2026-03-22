import Progress from "../models/Progress.js";
import Log from "../models/Log.js";
import Lab from "../models/Lab.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await Progress.find({ userId }).populate("labId");
    
    const completedLabs = progress.filter(p => p.status === "completed");
    const inProgressLabs = progress.filter(p => p.status === "in-progress");
    
    const totalPoints = completedLabs.reduce((sum, p) => sum + p.score, 0);
    const attackCompleted = completedLabs.filter(p => p.labId?.category === "attack").length;
    const defenseCompleted = completedLabs.filter(p => p.labId?.category === "defense").length;

    const recentLogs = await Log.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("labId");

    const allLabs = await Lab.find();
    const totalLabsAvailable = allLabs.length;

    const stats = {
      totalLabs: totalLabsAvailable,
      completedLabs: completedLabs.length,
      inProgressLabs: inProgressLabs.length,
      attackCompleted,
      defenseCompleted,
      totalPoints,
      progressPercentage: Math.round((completedLabs.length / totalLabsAvailable) * 100) || 0,
      recentActivity: recentLogs.map(log => ({
        action: log.action,
        lab: log.labId?.title || "Unknown",
        success: log.success,
        timestamp: log.timestamp
      })),
      streak: req.user.streak,
      rank: getRank(totalPoints)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailedStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [progress, logs, user] = await Promise.all([
      Progress.find({ userId }).populate("labId"),
      Log.find({ userId }),
      User.findById(userId).populate("achievements")
    ]);

    const dailyStats = await Log.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          actions: { $sum: 1 },
          successes: { $sum: { $cond: ["$success", 1, 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    res.json({
      progress,
      totalActions: logs.length,
      successfulActions: logs.filter(l => l.success).length,
      achievements: user.achievements,
      dailyStats,
      points: user.points,
      rank: getRank(user.points)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function getRank(points) {
  if (points >= 1000) return { name: "Elite Hacker", icon: "💎" };
  if (points >= 500) return { name: "Security Expert", icon: "⭐" };
  if (points >= 250) return { name: "Cyber Warrior", icon: "⚔️" };
  if (points >= 100) return { name: "Security Analyst", icon: "🔒" };
  if (points >= 50) return { name: "Junior Analyst", icon: "🎯" };
  return { name: "Newcomer", icon: "🌱" };
}

export const resetLabProgress = async (req, res) => {
  try {
    const { labId } = req.body;
    await Progress.findOneAndDelete({ userId: req.user._id, labId });
    res.json({ message: "Lab progress reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/routes/dashboardRoutes.js
import express from "express";
import {
  getEcoActions, // Existing: Get all historical actions
  getDailyEcoActions, // NEW: Get actions for today's checklist
  addEcoAction,
  updateEcoAction,
  deleteEcoAction,
  getUserAchievements,
  getAchievementDefinitions,
  getUserStatistics,
  getWeeklyCompletedActions,
  getLeaderboard,
  generateWeeklyReport,
  getCompletedActionsByCategory,
  generateReportByDateRange,
} from "../controllers/dashboardController.js";
import userAuth from "../middleware/userAuth.js"; // Import the middleware

const router = express.Router();

// Apply userAuth middleware to all subsequent routes in this router
router.use(userAuth);

// Existing Eco Action routes (e.g., for historical view if needed)
router.get("/eco-actions", getEcoActions); // You can keep this for a history page

// NEW: Route to get actions for the daily checklist
router.get("/daily-actions", getDailyEcoActions); // GET /api/dashboard/daily-actions

// Existing routes for adding, updating, and deleting actions
router.post("/eco-actions", addEcoAction); // Actions added here are considered "today's" actions
router.put("/eco-actions/:actionId", updateEcoAction);
router.delete("/eco-actions/:actionId", deleteEcoAction);

// Existing Achievements routes
router.get("/achievements", getUserAchievements);
router.get("/achievement-definitions", getAchievementDefinitions);

// NEW: Route to get user statistics
router.get("/stats", getUserStatistics); // GET /api/dashboard/stats
router.get("/analytics/weekly-completed-actions", getWeeklyCompletedActions);
router.get("/analytics/category-breakdown", getCompletedActionsByCategory); // GET /api/dashboard/analytics/category-breakdown

// NEW: Route to get the leaderboard data
router.get("/leaderboard", getLeaderboard); // GET /api/dashboard/leaderboard

router.post("/generate-weekly-report", generateWeeklyReport); // POST /api/dashboard/generate-weekly-report
router.post("/analytics/report-range", generateReportByDateRange); // POST /api/dashboard/analytics/report-range
export default router;

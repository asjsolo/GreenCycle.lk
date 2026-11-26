// backend/routes/footprintRoutes.js
import express from "express";
// Import controller functions
import {
  calculateFootprint,
  saveFootprintUsage,
  getFootprintHistory,
  generatePlasticReport,
  deleteFootprintUsage,
} from "../controllers/footprintController.js";
// Import userAuth middleware (assuming its path)
import userAuth from "../middleware/userAuth.js"; // Adjust this path

const router = express.Router();

// --- Public Route for Calculation ---
// Anyone can access this to calculate, results are NOT saved here
router.post("/calculate", calculateFootprint);

// --- Protected Route for Saving Usage ---
// Only authenticated users can access this to save their results
router.post("/save-usage", userAuth, saveFootprintUsage); // Apply userAuth middleware

// --- NEW: Protected Route to Get Footprint History ---
// Only authenticated users can access this to view their history
router.get("/history", userAuth, getFootprintHistory); // Apply userAuth middleware
// Remove the old calculatePlasticFootprint function and the old POST /calculate handler from here
router.get("/report", userAuth, generatePlasticReport); // Apply userAuth middleware
router.delete("/history/:id", userAuth, deleteFootprintUsage); // DELETE /api/footprint/history/:id
export default router;

import express from "express";
import {
  getUserData,
  updateUserProfile,
  setMonthlyLimit, // --- NEW: Import the new controller function ---
  getUserPlasticData,
  trackCalculatorUsage,
} from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";

const userRouter = express.Router();

// Apply userAuth middleware to all routes below this line
userRouter.use(userAuth);

// --- Existing Protected Routes ---
userRouter.get("/data", getUserData);
userRouter.put("/profile", updateUserProfile); // PUT /api/user/profile

// --- NEW: Route to Set/Update Monthly Plastic Limit ---
// Use PUT for updating a resource (the user's limit)
userRouter.put("/set-monthly-limit", setMonthlyLimit); // PUT /api/user/set-monthly-limit

// --- NEW: Route to Get User Plastic Data (Limit and Current Usage) ---
// Use GET for fetching data
userRouter.get("/plastic-data", getUserPlasticData); // GET /api/user/plastic-data
userRouter.put("/track-calculator-usage", userAuth, trackCalculatorUsage);

export default userRouter;

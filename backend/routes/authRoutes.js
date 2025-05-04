import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
  isVerified,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

// Public routes (no authentication required)
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout); // Logout doesn't require auth middleware to clear cookie
authRouter.post("/send-reset-otp", sendResetOtp); // Forgot password flow
authRouter.post("/reset-password", resetPassword); // Forgot password flow

// Routes that require authentication (via userAuth middleware)
// These are generally for users who are logged in (token is valid)
// The middleware will check for isAccountVerified status on these routes
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp); // For logged-in but unverified users to resend OTP
authRouter.post("/verify-account", userAuth, verifyEmail); // For logged-in but unverified users to verify with OTP
authRouter.get("/is-auth", userAuth, isAuthenticated); // Check if currently authenticated and verified (used by frontend on load)
authRouter.get("/is-verified", userAuth, isVerified); // Check verification status (if needed separately from is-auth)

export default authRouter;

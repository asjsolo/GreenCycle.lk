import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Added select: false so password is not returned by default in queries
  password: { type: String, required: true, select: false },

  verifyOtp: { type: String, default: "" },
  // Corrected typo: verifyOtpExpireAt
  verifyOtpExpireAt: { type: Number, default: 0 },
  // Corrected typo: isAccounteVerified -> isAccountVerified
  isAccountVerified: { type: Boolean, default: false },

  resetOtp: { type: String, default: "" },
  // Corrected typo: resetOtpExpiredAt -> resetOtpExpireAt
  resetOtpExpireAt: { type: Number, default: 0 },

  // Add any other user-related fields here in the future
});

// Use mongoose.models.user || mongoose.model pattern
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;

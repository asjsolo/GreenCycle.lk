// backend/controllers/userController.js
import userModel from "../models/userModel.js";
//import validator from "validator";
import PlasticUsage from "../models/PlasticUsage.js";
import mongoose from "mongoose";
import { checkAndAwardAchievements } from "./dashboardController.js";
import { achievementDefinitions } from "../utils/achievements.js";

export const getUserData = async (req, res) => {
  try {
    // The user object is attached to the request by the userAuth middleware
    // If this controller is reached, req.user is guaranteed to exist and be the authenticated user
    const user = req.user; // <<< Use the user object attached by middleware

    // No need to findById again, as userAuth already did this.

    // Since userAuth passed, the user is authenticated. Always return success: true.
    res.status(200).json({
      // <<< Return 200 OK status
      success: true,
      // Return the user data under the 'user' key as expected by AuthContext
      user: {
        // <<< Changed from 'userData' to 'user'
        _id: user._id, // Include the user ID
        name: user.name,
        email: user.email, // Include email if needed on the frontend
        isAccountVerified: user.isAccountVerified,
        // Include any other user fields needed on the frontend (excluding password hash)
        // Example: avatarUrl: user.avatarUrl,
      },
      message: "User data fetched successfully.", // Optional success message
    });
  } catch (error) {
    console.error("Error in getUserData controller:", error); // Log the actual error
    // If an unexpected error occurs *after* userAuth, return a 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while fetching user data.",
    });
  }
};

// --- NEW Controller: Update User Profile ---
export const updateUserProfile = async (req, res) => {
  try {
    // The authenticated user is available via req.user from the userAuth middleware
    const user = req.user;
    const userId = user._id; // Get the user ID

    // Get the fields to update from the request body
    // Only allow specific fields to be updated for security
    const { name, email } = req.body; // Example: Allow updating name and email

    // Create an object with the fields to update
    const fieldsToUpdate = {};
    if (name !== undefined) {
      // Check if name is provided in the body
      // Basic validation for name (optional, but good practice)
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Name must be a non-empty string.",
        });
      }
      fieldsToUpdate.name = name.trim(); // Trim whitespace
    }

    // --- Handle Email Update (More Complex) ---
    // Changing email often requires re-verification.
    // For a simple implementation, you might disallow email changes via this route.
    // For a more complete implementation, you'd need to:
    // 1. Validate the new email.
    // 2. Check if the new email is already in use by another user.
    // 3. Send a new verification email to the new address.
    // 4. Mark the account as unverified until the new email is confirmed.
    // 5. Potentially require the user to confirm the change from their old email address.

    // For now, let's disallow email updates via this simple profile update route
    // or handle it with a basic check.
    if (email !== undefined && email !== user.email) {
      // Option 1: Disallow email changes via this route
      return res.status(400).json({
        success: false,
        message: "Email cannot be updated via this route.",
      });

      // Option 2: Basic validation (without re-verification flow - NOT RECOMMENDED for production)
      /*
           if (!validator.isEmail(email)) {
               return res.status(400).json({ success: false, message: "Please provide a valid email address." });
           }
           // Check if email is already in use by another user (requires DB query)
           const existingUserWithEmail = await userModel.findOne({ email });
           if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId.toString()) {
               return res.status(400).json({ success: false, message: "Email is already in use." });
           }
           fieldsToUpdate.email = email.trim();
           // If email changes, you might want to mark the account as unverified
           // fieldsToUpdate.isAccountVerified = false;
           // And potentially send a new verification email...
           */
    }

    // If no fields are provided for update, return a message
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    // Find the user by ID and update their profile with the specified fields
    // use findByIdAndUpdate with { new: true } to return the updated document
    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: fieldsToUpdate }, // Use $set to update only the specified fields
        { new: true, runValidators: true } // new: true returns the updated doc, runValidators: true runs schema validators
      )
      .select("-password"); // Exclude password from the returned document

    if (!updatedUser) {
      // This case should ideally not happen if userAuth middleware works correctly,
      // but it's a safety check.
      console.error(
        `updateUserProfile: User with ID ${userId} not found during update.`
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    console.log(
      `updateUserProfile: Successfully updated profile for user ${userId}.`
    ); // Debug log

    // Respond with the updated user data (excluding sensitive info)
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        // Return updated user data similar to login/getUserData response
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAccountVerified: updatedUser.isAccountVerified,
        // Include other fields returned by findByIdAndUpdate if needed on frontend
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error); // Log the error
    // Handle specific Mongoose validation errors if needed
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while updating profile.",
    });
  }
};

// --- NEW Controller: Set Monthly Plastic Limit ---
// This function allows a logged-in user to set or update their monthly plastic limit
export const setMonthlyLimit = async (req, res) => {
  const userId = req.user._id;
  const { monthlyPlasticLimit } = req.body; // Get the new limit value from the request body

  // Input Validation
  // Check if the value is a number and non-negative
  // Allow setting to null to remove the limit
  if (typeof monthlyPlasticLimit !== "number" || monthlyPlasticLimit < 0) {
    if (monthlyPlasticLimit !== null) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid limit value. Please provide a non-negative number or null.",
      });
    }
  }

  try {
    console.log(
      `Attempting to set monthly limit for user ${userId} to: ${monthlyPlasticLimit}`
    );

    // Find the user by ID and update the monthlyPlasticLimit field
    const user = await userModel.findByIdAndUpdate(
      userId,
      { monthlyPlasticLimit: monthlyPlasticLimit },
      { new: true, runValidators: true, select: "+monthlyPlasticLimit" } // Return the updated document, run schema validators, select the field
    );

    if (!user) {
      console.error(`User ${userId} not found during setMonthlyLimit.`);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    console.log(`Successfully set monthly limit for user ${userId}.`);
    res.status(200).json({
      success: true,
      message: "Monthly limit updated successfully!",
      monthlyLimit: user.monthlyPlasticLimit,
    }); // Return the updated limit
  } catch (error) {
    console.error("Error in setMonthlyLimit controller:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the monthly limit.",
    });
  }
};

// --- NEW Controller: Get User Plastic Data (Limit and Current Monthly Usage) ---
// This function fetches user profile data, their monthly limit, and calculates their current month's plastic usage
export const getUserPlasticData = async (req, res) => {
  const userId = req.user._id; // User ID from authenticated request

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    console.log(`Fetching user plastic data for user: ${userId}`);

    // 1. Fetch User document to get the monthly limit
    // Use findById and explicitly select the monthlyPlasticLimit field
    const user = await userModel
      .findById(userId)
      .select("+monthlyPlasticLimit");

    if (!user) {
      console.error(`User ${userId} not found during getUserPlasticData.`);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const monthlyLimit = user.monthlyPlasticLimit;
    console.log(`User ${userId} has monthly limit: ${monthlyLimit}`);

    // 2. Calculate current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    // Use the next month's first day and subtract a millisecond to get the very end of the current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    console.log(
      `Calculating usage from ${startOfMonth} to ${endOfMonth} for user ${userId}.`
    );

    // Aggregate plastic usage records for the current month
    const monthlyUsageAggregation = await PlasticUsage.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Match user ID (ensure ObjectId type)
          date: {
            $gte: startOfMonth, // Greater than or equal to start of month
            $lte: endOfMonth, // Less than or equal to end of month
          },
        },
      },
      {
        $group: {
          _id: null, // Group all matched documents together
          totalCarbonFootprint: { $sum: "$carbonFootprint" }, // Sum carbon footprint
          // totalPoints: { $sum: "$points" } // Sum points (optional)
        },
      },
    ]);

    // The result is an array; the first element (if any) contains the sums
    const monthlyUsage =
      monthlyUsageAggregation.length > 0
        ? monthlyUsageAggregation[0]
        : { totalCarbonFootprint: 0 };

    console.log(`Calculated monthly usage for user ${userId}:`, monthlyUsage);

    // 3. Return the data
    res.status(200).json({
      success: true,
      monthlyLimit: monthlyLimit,
      currentMonthlyUsage: {
        carbonFootprint: monthlyUsage.totalCarbonFootprint,
        // points: monthlyUsage.totalPoints // Optional
      },
      message: "User plastic data fetched successfully.",
    });
  } catch (error) {
    console.error("Error in getUserPlasticData controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user plastic data.",
    });
  }
};

// --- Updated Controller: Track Plastic Footprint Calculator Usage ---
export const trackCalculatorUsage = async (req, res) => {
  try {
    const userId = req.user._id; // User ID is attached by userAuth middleware

    // Find the user by ID
    const user = await userModel.findById(userId);

    if (!user) {
      console.warn(`Track Calculator Usage: User not found with ID: ${userId}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Store the count before incrementing to check if the threshold is met *after* this increment
    const countBeforeIncrement = user.calculatorUsesCount || 0;

    // Increment the calculator uses count
    user.calculatorUsesCount = countBeforeIncrement + 1;

    // Save the updated user document
    await user.save();

    console.log(
      `Track Calculator Usage: User ${userId} calculator count incremented to ${user.calculatorUsesCount}`
    ); // Debug log

    // --- Trigger Achievement Check ---
    // Call the helper function to check and award achievements based on the new count
    // We only need to check if the *new* count meets the threshold, and if the achievement hasn't been earned.
    // The checkAndAwardAchievements helper already handles checking if it's already earned.
    // We can optimize this slightly by only checking if the count *just* reached or exceeded the threshold,
    // but calling the general helper is simpler for now.

    let newlyAwardedAchievements = [];
    // Only check if the user was below the threshold *before* this increment
    // and is now at or above it. This prevents unnecessary checks.
    const calculatorMasterAchievementDef = achievementDefinitions.find(
      (def) => def.name === "Plastic Footprint Master"
    );

    if (
      calculatorMasterAchievementDef &&
      countBeforeIncrement <
        calculatorMasterAchievementDef.criteria.threshold &&
      user.calculatorUsesCount >=
        calculatorMasterAchievementDef.criteria.threshold
    ) {
      console.log(
        `User ${userId} reached or exceeded calculator usage threshold. Checking for achievement.`
      );
      // Call the general check helper. It will find the 'Plastic Footprint Master' achievement
      // and award it if not already earned based on the updated user.calculatorUsesCount.
      newlyAwardedAchievements = await checkAndAwardAchievements(userId);
      console.log(
        `checkAndAwardAchievements returned ${newlyAwardedAchievements.length} awarded achievements.`
      );
    } else {
      console.log(
        `User ${userId} calculator usage (${user.calculatorUsesCount}) did not trigger 'Plastic Footprint Master' achievement check this time.`
      );
    }

    // --- Success response ---
    const responseBody = {
      success: true,
      message: "Calculator usage tracked successfully.",
      calculatorUsesCount: user.calculatorUsesCount, // Return the new count
    };

    // Include newly awarded achievements in the response if any
    if (newlyAwardedAchievements.length > 0) {
      responseBody.awardedAchievements = newlyAwardedAchievements;
      console.log(
        "Response includes awarded achievements:",
        newlyAwardedAchievements.map((ach) => ach.name).join(", ")
      );
    }

    res.status(200).json(responseBody); // Send the response
  } catch (error) {
    console.error(
      "Error tracking calculator usage and checking achievements:",
      error
    ); // Log the error
    // Return a 500 error if anything goes wrong
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while tracking usage.",
    });
  }
};

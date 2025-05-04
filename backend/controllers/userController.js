// backend/controllers/userController.js
import userModel from "../models/userModel.js";
//import validator from "validator";

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

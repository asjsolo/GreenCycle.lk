import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js"; // Assuming transporter is set up here

// Helper function to generate OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// Helper function to send email (basic error logging)
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    // console.log(`Email sent to ${mailOptions.to} with subject "${mailOptions.subject}"`); // Optional success log
  } catch (error) {
    console.error(
      `Failed to send email to ${mailOptions.to} with subject "${mailOptions.subject}":`,
      error
    );
    // In a real app, you might use a dedicated email queue or retry mechanism
    throw new Error("Failed to send email"); // Propagate error if email sending is critical
  }
};

// --- Register ---
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Use status codes for validation errors
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  try {
    const existUser = await userModel.findOne({ email });

    // Use 409 Conflict for duplicate resource
    if (existUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash password with a salt round (10 is a good default)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const user = new userModel({
      name,
      email,
      password: hashedPassword, // Store hashed password
      isAccountVerified: false, // Account is unverified initially
      // OTP fields will be set later if verification email is sent immediately
    });

    // Generate and store verification OTP *before* saving the user for the first time
    const otp = generateOtp();
    user.verifyOtp = otp;
    // Set expiry (e.g., 24 hours)
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    // Save the new user to the database
    await user.save();

    // --- Send Verification Email ---
    const verificationMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Verification OTP for GreenCycle.lk",
      text: `Welcome to GreenCycle.lk! Your OTP to verify your email address is: ${otp}. Please use this code to activate your account. This OTP is valid for 24 hours.`,
      // Consider adding an HTML template for a better-looking email
    };
    await sendEmail(verificationMailOptions); // Use helper function

    // --- Send Welcome Email (Optional/Combined) ---
    // If you want a separate welcome email, send it here.
    // Otherwise, make the verification email also welcoming.
    // For simplicity, the verification email above is also the welcome email now.

    // --- Generate and Send JWT Token (Login on Register) ---
    // This generates a token immediately after registration.
    // The userAuth middleware will then check isAccountVerified and block access to protected routes.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    // Set the JWT as an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS access
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      // 'lax' is a common default for cookies used by API on same site but different origin (like localhost:3000 -> localhost:4000)
      // 'none' is needed for true cross-site access (requires secure: true)
      // 'strict' is safest if cookies are only sent on same-site requests (e.g., server-rendered apps)
      // Let's use 'lax' for development/standard deployment
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'lax' as default, 'none' for production if cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry matches JWT expiry
    });

    // Send successful registration response
    // Include a flag if verification is needed (it always is after register)
    return res.status(201).json({
      // Use 201 Created
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      needsVerification: true, // Inform frontend verification is needed
      // Do NOT send userId in the response body like this usually,
      // unless verification requires it and can't get it from the cookie.
      // Since VerifyEmail now relies on getting userId from the cookie via middleware,
      // we don't need to send userId here explicitly.
      // userId: user._id, // Removed: Frontend gets userId from cookie via middleware
      // Optional: Send back minimal user info (excluding password)
      // user: { _id: user._id, name: user.name, email: user.email, isAccountVerified: user.isAccountVerified }
    });
  } catch (error) {
    console.error("Registration Error:", error); // Log the detailed error server-side
    // Send a generic error message to the client
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during registration.",
    });
  }
};

// --- Login ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      // Use 400 Bad Request
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Find user by email and explicitly select the password field
    const user = await userModel.findOne({ email }).select("+password"); // Use .select('+password')

    // Check if user exists
    if (!user) {
      // Return a generic error message to prevent email enumeration
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." }); // Use 401 Unauthorized
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // Check if passwords match
    if (!isMatch) {
      // Return a generic error message
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." }); // Use 401 Unauthorized
    }

    // --- Handle Unverified Account ---
    if (!user.isAccountVerified) {
      // Account is not verified. Generate and send a *new* verification OTP.
      // This allows users who registered but didn't verify to log in and get a new code.
      const otp = generateOtp();
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // Set expiry
      await user.save(); // Save the new OTP details

      // Send the verification email with the new OTP
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account Verification OTP",
        text: `Your new OTP to verify your account is: ${otp}. Use this code to activate your account. This OTP is valid for 24 hours.`,
      };
      await sendEmail(mailOptions); // Use helper function

      // Generate a JWT token even for unverified users.
      // The middleware will use the `isAccountVerified` flag in the user object (attached via `req.user`)
      // to block access to protected resources. This token allows them to access verification endpoints.
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token valid for 7 days
      });

      // Set the token cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'lax'
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Inform the frontend that the account needs verification and a new OTP was sent
      return res.status(403).json({
        // Use 403 Forbidden as they can't access dashboard yet
        success: false, // Indicate that login was NOT fully successful (access denied)
        message: "Account not verified. A new OTP has been sent to your email.",
        needsVerification: true, // Flag for frontend
        // No need to send userId here, frontend gets it from cookie via middleware if needed
        // userId: user._id, // Removed
      });
    }

    // Account is verified - Generate and Send JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    // Set the JWT as an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'lax'
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Successful login response (for verified users)
    // Include user data (excluding password) for the frontend AuthContext
    // Use 200 OK
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      needsVerification: false, // Explicitly false for verified users
      user: {
        // Send user data needed by frontend context
        _id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified, // Should be true here
        // Include any other non-sensitive user data needed by the frontend
      },
    });
  } catch (error) {
    console.error("Login Error:", error); // Log detailed error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login.",
    }); // Generic error
  }
};

// --- Logout ---
export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    // Ensure sameSame, secure, and path match the cookie options used when setting the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'lax'
      // path: '/' // Often cookies are set with path '/', explicitly clearing helps
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged Out successfully." }); // Use 200 OK
  } catch (error) {
    console.error("Logout Error:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during logout.",
    });
  }
};

// --- Check if user is authenticated (Used by frontend on initial load) ---
// This route is protected by userAuth middleware.
// If reached, userAuth has already validated the token and attached req.user (a verified user).
export const isAuthenticated = async (req, res) => {
  try {
    // If userAuth middleware successfully executed next(),
    // it means the token was valid AND the user is verified.
    // We can send back success and user info.
    if (req.user) {
      // Check if user object was attached by middleware
      return res.status(200).json({
        success: true,
        message: "User is authenticated and verified.",
        user: {
          // Send user data (excluding password due to select: false in model)
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          isAccountVerified: req.user.isAccountVerified, // Should be true here
          // Include any other non-sensitive user data needed by the frontend AuthContext
          // e.g., totalPoints: req.user.totalPoints,
        },
      });
    } else {
      // This case should ideally not be reached if userAuth middleware works correctly,
      // as userAuth returns 401/403 before hitting this.
      // But as a fallback:
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed." });
    }
  } catch (error) {
    console.error("isAuthenticated check Error:", error); // Log error
    // The userAuth middleware should handle token errors (401).
    // This catch is for errors *within* this controller logic if middleware passed.
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// --- Check if user account is verified ---
// This route is also protected by userAuth.
// Given userAuth already blocks unverified users from protected routes,
// this route will only be hit by verified users.
// It might be slightly redundant if isAuthenticated already provides the status.
// However, keeping it can allow for a simple endpoint to check just verification status if needed.
// Let's modify it to explicitly return the verification status from req.user.
export const isVerified = async (req, res) => {
  try {
    // req.user is available here from userAuth middleware (if user is auth and verified)
    if (req.user) {
      return res.status(200).json({
        success: true, // Indicate the request was successful
        isVerified: req.user.isAccountVerified, // Get status from user object
        // This should be true if userAuth middleware allowed the request to reach here.
        // If you wanted a route accessible to *unverified* users to check status,
        // it shouldn't be protected by userAuth, but it would need to find the user differently (e.g., by email or ID from request).
      });
    } else {
      // This should not be reached if userAuth works
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
    }
  } catch (error) {
    console.error("isVerified check Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// --- Send Verification OTP (for logged-in unverified users) ---
// Route is protected by userAuth middleware. User must be logged in (even if unverified).
export const sendVerifyOtp = async (req, res) => {
  // Get user ID from the authenticated user via middleware
  const userId = req.user._id; // Correct way to get ID in protected route

  try {
    // Re-fetch user to ensure we have the latest state, although req.user should be up-to-date
    const user = await userModel.findById(userId);

    // Defensive checks (should not happen if userAuth passed)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // Check if already verified
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account is already verified." }); // Use 400 Bad Request
    }

    // Generate and store a new OTP
    const otp = generateOtp();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // Set expiry
    await user.save(); // Save updated user with new OTP

    console.log(
      "New OTP stored in database:",
      user.verifyOtp,
      "for user:",
      userId
    ); // Debug log

    // Send the email with the new OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your new OTP to verify your account is: ${otp}. Use this code to activate your account. This OTP is valid for 24 hours.`, // Added spacing
    };
    await sendEmail(mailOptions); // Use helper function

    return res
      .status(200)
      .json({ success: true, message: "Verification OTP sent to your email." }); // Use 200 OK
  } catch (error) {
    console.error("Error sending verification OTP:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while sending OTP.",
    });
  }
};

// --- Verify Email using OTP (for logged-in unverified users) ---
// Route is protected by userAuth middleware. User must be logged in (even if unverified).
export const verifyEmail = async (req, res) => {
  const { otp } = req.body; // Get OTP from request body
  // Get user ID from the authenticated user via middleware
  const userId = req.user._id; // Correct way to get ID in protected route

  // Use status codes for validation errors
  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is required." });
  }

  try {
    // Re-fetch user to ensure we have the latest OTP state, although req.user might suffice
    const user = await userModel.findById(userId);

    // Defensive checks (should not happen if userAuth passed)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if the user is already verified
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account is already verified." });
    }

    // Check if OTP matches and has not expired
    // Check against user.verifyOtpExpireAt (correct typo)
    if (
      !user.verifyOtp ||
      user.verifyOtp !== otp.trim() ||
      user.verifyOtpExpireAt < Date.now()
    ) {
      // Clear OTP fields on failed attempt (optional security)
      user.verifyOtp = "";
      user.verifyOtpExpireAt = 0;
      await user.save();
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." }); // Use 400 Bad Request
    }

    // OTP is valid - Mark account as verified
    user.isAccountVerified = true;
    user.verifyOtp = ""; // Clear OTP fields after successful verification
    user.verifyOtpExpireAt = 0;

    await user.save(); // Save the updated user

    // Respond with success message
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" }); // Use 200 OK
  } catch (error) {
    console.error("Error verifying email:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during verification.",
    });
  }
};

// --- Send Password Reset OTP ---
// This route should NOT be protected by userAuth.
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    // Find user by email (not ID, as user is not authenticated)
    const user = await userModel.findOne({ email });

    // For security, return success even if user not found to prevent email enumeration.
    // A real-world app might just return 200 success and say "If account exists, email sent".
    // For a university project, explicitly saying "User not found" is probably fine for usability.
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with that email." }); // Use 404 Not Found
    }

    // Generate and store reset OTP
    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save(); // Save updated user with new OTP

    // Send reset password email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP for GreenCycle.lk",
      text: `Your OTP for resetting your password is: ${otp}. Use this code to proceed with resetting your password. This OTP is valid for 15 minutes.`,
      // Consider HTML version
    };
    await sendEmail(mailOptions); // Use helper function

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
    }); // Use 200 OK
  } catch (error) {
    console.error("Error sending reset OTP:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while sending reset OTP.",
    });
  }
};

// --- Verify OTP and Reset Password ---
// This route should NOT be protected by userAuth.
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Use status codes for validation errors
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required.",
    });
  }

  try {
    // Find user by email and select the password field
    const user = await userModel.findOne({ email }).select("+password"); // Use .select('+password')

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." }); // Use 404 Not Found
    }

    // Check if OTP matches and has not expired
    // Check against user.resetOtpExpireAt (correct typo)
    if (
      !user.resetOtp ||
      user.resetOtp !== otp.trim() ||
      user.resetOtpExpireAt < Date.now()
    ) {
      // Clear OTP fields on failed attempt (optional security)
      user.resetOtp = "";
      user.resetOtpExpireAt = 0;
      await user.save();
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." }); // Use 400 Bad Request
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0; // Corrected typo

    await user.save(); // Save the updated user

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error resetting password:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during password reset.",
    });
  }
};

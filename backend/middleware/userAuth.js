// In backend/middleware/userAuth.js

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    console.log("userAuth: Token missing. Returning 401.");
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Login Again." });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode || !tokenDecode.id) {
      // Check if decode failed or no ID
      console.log(
        "userAuth: Token verified but missing ID or invalid decode. Returning 401."
      );
      // Call clear cookie here if verification itself failed or payload is bad
      console.log(
        "userAuth: --- Clearing cookie due to invalid token decode/payload ---"
      ); // Specific log
      res.clearCookie("token");
      return res
        .status(401)
        .json({ success: false, message: "Not authorized. Invalid token." });
    }
    console.log("userAuth: Token verified. Decoded ID:", tokenDecode.id);

    const user = await userModel.findById(tokenDecode.id).select("-password");
    if (!user) {
      console.log(
        "userAuth: User ID from token not found in DB. Clearing cookie and returning 401."
      );
      console.log("userAuth: --- Clearing cookie due to user not found ---"); // Specific log
      res.clearCookie("token");
      return res
        .status(401)
        .json({ success: false, message: "User not found. Login Again." });
    }
    console.log(
      `userAuth: User ${user._id} object and ID attached to request.`
    );
    req.user = user;
    req.userId = user._id;

    const fullRequestPath = req.baseUrl + req.path;
    console.log(
      `userAuth: Checking verification status for path: ${fullRequestPath}. User verified status: ${user.isAccountVerified}`
    );

    const allowedForUnverifiedPaths = [
      "/api/auth/verify-account",
      "/api/auth/send-verify-otp",
      "/api/auth/is-verified",
    ];

    if (!user.isAccountVerified) {
      const isAccessingAllowedPath =
        allowedForUnverifiedPaths.includes(fullRequestPath);
      if (!isAccessingAllowedPath) {
        console.log(
          `userAuth: Blocking unverified user ${user._id} from disallowed path ${fullRequestPath}. Returning 403.`
        );
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Account not verified. Please verify your email to access this resource.",
          });
      }
      console.log(
        `userAuth: Allowing unverified user ${user._id} access to allowed path ${fullRequestPath}.`
      );
    } else {
      console.log(
        `userAuth: Verified user ${user._id} accessing ${fullRequestPath}. Allowing.`
      );
    }

    console.log(
      `userAuth: Authentication/Verification check passed for user ${user._id} on path ${fullRequestPath}. Calling next().`
    );
    next();
  } catch (error) {
    // This catch block handles errors during JWT verification (e.g., expired, invalid signature)
    // OR any unexpected errors thrown within the try block.
    console.error("--- Auth Middleware Error Caught ---");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack); // <<< Log the full stack trace

    // Only clear cookie for JWT-related errors or general unexpected errors
    // If error.name is 'JsonWebTokenError' or 'TokenExpiredError', definitely clear.
    // For other errors, clearing might be too aggressive, but let's keep it for now
    // unless the stack trace points elsewhere.
    console.log("userAuth: --- Clearing cookie due to caught error ---"); // Specific log
    res.clearCookie("token"); // Clear the invalid or expired cookie
    return res
      .status(401)
      .json({
        success: false,
        message: "Not authorized. Invalid or expired session.",
      });
  }
};

export default userAuth;

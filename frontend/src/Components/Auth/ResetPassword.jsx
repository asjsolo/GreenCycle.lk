//MADE CSS EDITS
// frontend/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Components/Auth/AuthForms.css"; // Adjust path as needed

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(""); // Use a single message state
  const [isError, setIsError] = useState(false); // State to track if message is an error
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setIsError(false);
    setIsLoading(true);

    // Basic frontend validation
    if (!email || !otp || !newPassword) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Call your backend's reset password endpoint
      const response = await fetch(
        "http://localhost:4000/api/auth/reset-password",
        {
          // Use your endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await response.json();

      // Backend resetPassword returns 200 on success, 400 for invalid/expired OTP/validation, 404 if user not found, 500 for server error
      if (response.ok) {
        // Status 200 OK
        setMessage(
          data.message || "Password reset successfully! You can now log in."
        );
        setIsError(false); // It's a success message
        // Clear form fields on success
        setEmail("");
        setOtp("");
        setNewPassword("");
        // Optional: Redirect to login after a delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000); // Redirect after 3 seconds
      } else {
        // Handle non-2xx status codes (400, 404, 500)
        setMessage(data.message || "Password reset failed.");
        setIsError(true); // It's an error message
        // Clear sensitive fields on failure
        setOtp("");
        setNewPassword("");
      }
    } catch (error) {
      setMessage("An error occurred while resetting password.");
      setIsError(true);
      console.error("Reset Password fetch error:", error);
      // Clear sensitive fields on failure
      setOtp("");
      setNewPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Reset Password</h2>

        {/* Display messages */}
        {message && (
          <p className={`auth-message ${isError ? "error" : "success"}`}>
            {" "}
            {/* Use dynamic class */}
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            {/* Visually hidden label */}
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>
          <div className="auth-form-group">
            {/* Visually hidden label */}
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter OTP"
              minLength="6" // Basic frontend validation
              maxLength="6"
              pattern="\d{6}" // Require 6 digits
              title="Please enter a 6-digit code"
            />
          </div>
          <div className="auth-form-group">
            {/* Visually hidden label */}
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter new password"
            />
            {/* Optional: Add a password visibility toggle icon here */}
          </div>

          {/* Use auth-button-primary for the submit button */}
          <button
            type="submit"
            className="auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "RESETTING PASSWORD..." : "RESET PASSWORD"}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="auth-links">
          <p>
            Remember your password?{" "}
            <button onClick={() => navigate("/login")}>Login here</button>
          </p>
          {/* Optional: Link back to Forgot Password if user lost OTP */}
          <p>
            Didn't get an OTP?{" "}
            <button onClick={() => navigate("/forgot-password")}>
              Request new OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

//MADE CSS EDITS
// frontend/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Components/Auth/AuthForms.css"; // Adjust path as needed

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // Use a single message state
  const [isError, setIsError] = useState(false); // State to track if message is an error
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setIsError(false);
    setIsLoading(true);

    try {
      // Call your backend's send reset OTP endpoint
      const response = await fetch(
        "http://localhost:4000/api/auth/send-reset-otp",
        {
          // Use your endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      // Backend sendResetOtp returns 200 on success, 404 if user not found, 400 for validation, 500 for server error
      if (response.ok) {
        // Status 200 OK
        setMessage(data.message || "Password reset OTP sent to your email.");
        setIsError(false); // It's a success message
        // Do NOT clear email field immediately, user might need it for the next step
      } else {
        // Handle non-2xx status codes (400, 404, 500)
        setMessage(data.message || "Failed to send password reset OTP.");
        setIsError(true); // It's an error message
      }
    } catch (error) {
      setMessage("An error occurred while requesting password reset.");
      setIsError(true);
      console.error("Forgot Password fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Forgot Password</h2>

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

          {/* Use auth-button-primary for the submit button */}
          <button
            type="submit"
            className="auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "SENDING OTP..." : "SEND RESET OTP"}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="auth-links">
          <p>
            Remember your password?{" "}
            <button onClick={() => navigate("/login")}>Login here</button>
          </p>
          {/* Optional: Link to the Reset Password page if user already has OTP */}
          <p>
            Already have an OTP?{" "}
            <button onClick={() => navigate("/reset-password")}>
              Reset Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

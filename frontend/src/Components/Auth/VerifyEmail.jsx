//MADE CSS EDITS
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "../Auth/AuthForms.css"; // Import the common CSS file (adjust path)

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, isVerified, setAccountVerified } = useContext(AuthContext);

  useEffect(() => {
    if (isVerified) {
      console.log("User is already verified. Redirecting to dashboard.");
      navigate("/dashboard", { replace: true });
    }
  }, [isVerified, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (otp.trim().length !== 6) {
      setError("Please enter a 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    console.log("VerifyEmail: Attempting to verify OTP.");

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/verify-account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: otp.trim() }),
          credentials: "include",
        }
      );

      console.log(
        "VerifyEmail: Verify account response status:",
        response.status
      );
      const data = await response.json();
      console.log("VerifyEmail: Verify account response data:", data);

      if (response.ok) {
        setSuccessMessage(data.message || "Email verified successfully!");
        setAccountVerified();
        setTimeout(() => {
          console.log(
            "VerifyEmail: Verification successful. Redirecting to dashboard."
          );
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else {
        console.error(
          "VerifyEmail: Verification failed. Status:",
          response.status,
          "Message:",
          data.message
        );
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      console.error("VerifyEmail: Verification fetch error:", err);
      setError("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    console.log("VerifyEmail: Attempting to resend OTP.");

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/send-verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      console.log("VerifyEmail: Resend OTP response status:", response.status);
      const data = await response.json();
      console.log("VerifyEmail: Resend OTP response data:", data);

      if (response.ok) {
        setSuccessMessage(data.message || "New OTP sent to your email.");
        setOtp("");
      } else {
        console.error(
          "VerifyEmail: Resend OTP failed. Status:",
          response.status,
          "Message:",
          data.message
        );
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error("VerifyEmail: Resend OTP fetch error:", err);
      setError("An error occurred while resending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Verify Your Email</h2>

        {/* Display user's email from context if available */}
        {user && (
          <p className="text-white text-opacity-80 mb-4">
            {" "}
            {/* Style the text */}
            Please enter the OTP sent to{" "}
            <span className="font-bold">{user.email}</span>.
          </p>
        )}
        {!user && (
          <p className="text-white text-opacity-80 mb-4">
            Please enter the OTP sent to your email address.
          </p>
        )}

        {error && <p className="auth-message error">{error}</p>}
        {successMessage && (
          <p className="auth-message success">{successMessage}</p>
        )}

        <form onSubmit={handleVerify}>
          <div className="auth-form-group">
            {/* Visually hidden label */}
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              minLength="6"
              maxLength="6"
              pattern="\d{6}"
              title="Please enter a 6-digit code"
              disabled={isLoading}
              placeholder="Enter OTP"
            />
          </div>
          {/* Use auth-button-primary for the main verify button */}
          <button
            type="submit"
            className="auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "VERIFYING..." : "VERIFY"} {/* Uppercase text */}
          </button>
        </form>

        <div className="auth-links">
          {/* Use auth-links button style for resend */}
          <button onClick={handleResendOtp} disabled={isLoading}>
            {isLoading ? "SENDING NEW OTP..." : "RESEND OTP"}{" "}
            {/* Uppercase text */}
          </button>
          {/* Optional: Add a link to login if they landed here without being logged in */}
          {!user && (
            <p>
              Already verified or need to log in?{" "}
              {/* Use auth-links button style */}
              <button onClick={() => navigate("/login")}>Go to Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;

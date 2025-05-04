import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "../Auth/AuthForms.css"; // Import the common CSS file

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful (verified).");
        setSuccessMessage(data.message || "Login successful!");
        login(data.user);
        navigate("/", { replace: true });
      } else if (response.status === 403 && data.needsVerification) {
        console.log("Login successful, but verification needed.");
        setError(
          data.message || "Account not verified. Please verify your email."
        );
        navigate("/verify-email", { replace: true });
      } else {
        console.error("Login failed:", response.status, data.message);
        setError(data.message || "Login failed");
        setPassword("");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login fetch error:", error);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Login</h2>

        {error && <p className="auth-message error">{error}</p>}
        {successMessage && (
          <p className="auth-message success">{successMessage}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            {/* Visually hidden label for accessibility */}
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            {/* Visually hidden label for accessibility */}
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Password"
            />
          </div>
          {/* Use auth-button-primary for the main login button */}
          <button
            type="submit"
            className="auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"} {/* Uppercase text */}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? {/* Use auth-links button style */}
            <button onClick={() => navigate("/register")}>Register here</button>
          </p>
          <p>
            {/* Use auth-links button style */}
            <button onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth/AuthForms.css"; // Import the common CSS file

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        setError(data.message || "Registration failed");
        setPassword("");
      }
    } catch (error) {
      setError("An error occurred during registration");
      console.error("Registration error:", error);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Create your profile</h2> {/* Updated heading text */}
        {error && <p className="auth-message error">{error}</p>}
        {successMessage && (
          <p className="auth-message success">{successMessage}</p>
        )}
        <form onSubmit={handleRegistration}>
          {/* Add Age field placeholder/info - Image shows this */}
          {/* You might want to add a real input for age later */}
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="text"
              id="age"
              placeholder="Age"
              disabled={true}
            />{" "}
            {/* Placeholder, disabled for now */}
            <p className="text-xs text-gray-400 mt-1 text-left">
              Providing your age ensures you get the right experience. For more
              details, please visit our Privacy Policy.{" "}
              {/* Example info text */}
            </p>
          </div>

          <div className="form-group">
            {/* Visually hidden label */}
            <label htmlFor="name">Name (optional)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Name (optional)"
            />
          </div>
          <div className="form-group">
            {/* Visually hidden label */}
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
            {/* Visually hidden label */}
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
            {/* Optional: Add a password visibility toggle icon here */}
          </div>
          {/* Use auth-button-primary for the main create account button */}
          <button
            type="submit"
            className="auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}{" "}
            {/* Uppercase text */}
          </button>
        </form>
        {/* Add OR separator and social login buttons if desired */}
        {/* <div className="auth-or-separator">OR</div>
        <button className="auth-button-secondary">
            <i className="fab fa-facebook-f mr-2"></i> FACEBOOK // Example Facebook button
        </button> */}
        <div className="auth-links">
          {/* Add privacy policy link etc. - Image shows this */}
          {/* <p>By signing in to Duolingo, you agree to our <button>Terms</button> and <button>Privacy Policy</button></p> */}

          <p>
            Already have an account? {/* Use auth-links button style */}
            <button onClick={() => navigate("/login")}>Login here</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

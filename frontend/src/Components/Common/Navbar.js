// Navbar.js
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Navbar.css";
import AuthContext from "../../context/AuthContext";

function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext); // Get isLoggedIn and logout
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST", // Or GET, depending on your backend route
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Added this line in the previous review, crucial!
      });

      // You might not strictly need to await the response.json() if you just want to clear state and redirect.
      // But checking success is good practice.
      const data = await response.json();

      // Check for successful status code (200 OK for logout is standard)
      if (response.ok) {
        // Check response.ok first
        console.log("Backend logout successful"); // Log success
        logout(); // Call the logout function from the context to clear state
        navigate("/login"); // Redirect to the login page AFTER context state is cleared
      } else {
        console.error("Logout failed on backend:", data.message);
        // Even if backend failed, clear client-side state for safety
        logout(); // Call context logout
        navigate("/login"); // Redirect anyway
      }
    } catch (error) {
      console.error("An error occurred during logout fetch:", error);
      // Even if fetch failed, clear client-side state for safety
      logout(); // Call context logout
      navigate("/login"); // Redirect anyway
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">GreenCycle.lk</div>
      <ul className="navbar-menu">
        {/* Link to the root path, which renders Home */}
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about-us">About Us</Link> {/* Link to the new route */}
        </li>
        {/* Update links based on your routing structure */}
        <li>
          <Link to="/awareness-hub">Awareness Hub</Link>
        </li>{" "}
        {/* Assuming this route exists */}
        <li>
          <Link to="/recycling-directory">Recycling Directory</Link>
        </li>{" "}
        {/* Assuming this route exists */}
        <li>
          <Link to="/plasticFootprintCalculator">
            Plastic Footprint Calculator
          </Link>
        </li>
        <li>
          <Link to="/community-forum">Community Forum</Link>
        </li>{" "}
        {/* Assuming this route exists */}
        {/* Link to the dashboard parent route */}
        <li>
          <Link to="/dashboard">User Dashboard</Link>
        </li>
        <li>
          <Link to="/contact-us">Contact Us</Link>
        </li>{" "}
        {/* Assuming this route exists */}
        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        ) : (
          <li>
            {/* Use a button with onClick for the logout action */}
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Navbar;

//changed greencycle name
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
        navigate("/"); // Redirect to the login page AFTER context state is cleared
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
      <div className="navbar-logo">greenCycle.lk</div>
      <ul className="navbar-menu">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about-us">About Us</Link>
        </li>

        <li className="dropdown">
          <span>Learn ▾</span>
          <ul className="dropdown-menu">
            <li>
              <Link to="/awareness-hub">Awareness Hub</Link>
            </li>
            <li>
              <Link to="/recycling-directory">Recycling Directory</Link>
            </li>
            <li>
              <Link to="/plasticFootprintCalculator">Plastic Calculator</Link>
            </li>
          </ul>
        </li>

        <li className="dropdown">
          <span>Community ▾</span>
          <ul className="dropdown-menu">
            <li>
              <Link to="/community-forum">Forum</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
          </ul>
        </li>

        <li className="dropdown">
          <span>Account ▾</span>
          <ul className="dropdown-menu">
            {isLoggedIn ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;

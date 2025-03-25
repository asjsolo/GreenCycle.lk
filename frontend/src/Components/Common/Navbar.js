import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-logo">GreenCycle.lk</div>
      <ul className="navbar-menu">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/">Awareness Hub</Link>
        </li>
        <li>
          <Link to="/">Recycling Directory</Link>
        </li>
        <li>
          <Link to="/plasticFootprintCalculator">
            Plastic Footprint Calculator
          </Link>
        </li>
        <li>
          <Link to="/">Community Forum</Link>
        </li>
        <li>
          <Link to="/registerLogin">User Dashboard</Link>
        </li>
        <li>
          <Link to="/">Contact Us</Link>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;

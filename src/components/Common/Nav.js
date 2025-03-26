import React from "react";
import { Link } from "react-router-dom";
import "./Nav.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-logo">GreenCycle.lk</div>
      <ul className="navbar-menu">
        <li>
          <Link to="">Home</Link>
        </li>
        <li>
          <Link to="">Awareness Hub</Link>
        </li>
        <li>
          <Link to="/">Recycling Directory</Link>
        </li>
        <li>
          <Link to="">
            Plastic Footprint Calculator
          </Link>
        </li>
        <li>
          <Link to="">Community Forum</Link>
        </li>
        <li>
          <Link to="">User Dashboard</Link>
        </li>
        <li>
          <Link to="">Contact Us</Link>
        </li>
        <li>
          <Link to="">Register</Link>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
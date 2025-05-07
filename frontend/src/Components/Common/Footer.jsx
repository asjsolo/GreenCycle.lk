// frontend/Components/Common/Footer.jsx
import React from "react";
import "./Footer.css"; // Create this CSS file for styling
import { Link } from "react-router-dom"; // Import Link for navigation

function Footer() {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section brand-info">
          <h3>GreenCycle.lk</h3>
          <p>&copy; {currentYear} GreenCycle.lk. All rights reserved.</p>
          {/* Optional: Add a short tagline */}
          {/* <p>Empowering sustainable action.</p> */}
        </div>

        <div className="footer-section footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {/* Add links to other public pages if they exist */}
            <li>
              <Link to="/about-us">About Us</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
            <li>
              <Link to="/plasticFootprintCalculator">Calculator</Link>
            </li>
            <li>
              <Link to="/awareness-hub">Awareness Hub</Link>
            </li>
            <li>
              <Link to="/recycling-directory">Directory</Link>
            </li>
            <li>
              <Link to="/community-forum">Forum</Link>
            </li>

            {/*Link to Login/Register if not logged in, or Dashboard if logged in
            (handled by Navbar, but can repeat here)
            {/* <li><Link to="/login">Login</Link></li> */}
            {/* <li><Link to="/register">Register</Link></li> */}
          </ul>
        </div>

        <div className="footer-section legal-links">
          <h4>Legal</h4>
          <ul>
            {/* Assuming you will create these pages later */}
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms-of-service">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Optional: Add a Contact Info or Social Media section */}
        <div className="footer-section contact-info">
          <h4>Contact Us</h4>
          <p>Email: info@greencycle.lk</p>
          <p>Phone: (123) 456-7890</p>
        </div>

        {/* Optional: Social Media Icons */}
        {/* <div className="footer-section social-media">
             <h4>Follow Us</h4>
             <div className="social-icons">
                 <a href="#"><i className="fab fa-facebook"></i></a>
                 <a href="#"><i className="fab fa-twitter"></i></a>
                 <a href="#"><i className="fab fa-instagram"></i></a>
             </div>
         </div> */}
      </div>
    </footer>
  );
}

export default Footer;

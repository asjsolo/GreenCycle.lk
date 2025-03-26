import React from "react";
import "../components/Footer.css"; // Import the CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
    return (
        <footer className="footer">
         

            {/* Footer Content */}
            <div className="footer-content">
                {/* Company Info */}
                <div className="footer-column">

                    <h1>♻️</h1>                    
                    <h4 >GreenCycle.lk </h4>
                    <h4>your partner in </h4>
                    <h4> plastic waste </h4>  
                    <h4>solutions</h4>          
                </div>

                {/* Company Links */}
                <div className="footer-column">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/community">Community</a></li>
                        <li><a href="/testimonial">Testimonial</a></li>
                    </ul>
                </div>

                {/* Support Links */}
                <div className="footer-column">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="/help-center">Help Center</a></li>
                        <li><a href="/tweet-us">Tweet Us</a></li>
                        <li><a href="/feedback">Feedback</a></li>
                    </ul>
                </div>

                {/* Useful Links */}
                <div className="footer-column">
                    <h3>Links</h3>
                    <ul>
                        <li><a href="/courses">Discover</a></li>
                        <li><a href="/become-teacher">Inquire</a></li>
                        <li><a href="/service">Service</a></li>
                        <li><a href="/all-in-one">All in One</a></li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="footer-column">
                    <h3>Contact Us</h3>
                    <ul>
                        <li>
                            <FontAwesomeIcon icon={faPhone} /> <br/>
                            <a href="tel:+94112222292">Tel : (+94) 11 222 22 92</a><br/>
                            <a href="tel:+94778753792">Tel : (+94) 77 875 37 92</a>

                        </li>
                        <li>
                            <FontAwesomeIcon icon={faEnvelope} />
                            <a href="mailto:support@mail.com">support.green.cycle.lk@gmail.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="copyright">
                <p>© Copyright {new Date().getFullYear()} GreenCycle.lk. All rights reserved.</p>
                              
            </div>
        </footer>
    );
};

export default Footer;
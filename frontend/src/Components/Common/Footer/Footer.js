import React from "react";
import "./Footer.css"; // Import the CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
        <footer className="footer">
            {/* Newsletter Subscription Section */}
            <div className="newsletter-section">
                <div className="newsletter-content"><img src="/images/Clipped_image_20250325_154106.png" 

                    alt="Vacuum Cleaner" className="newsletter-image" />
                    <div className="newsletter-text">
                        <h2>Subscribe to our services to get updates to our latest collections</h2><p>Get </p>
                        <p> <h2> 20% off </h2> on your first order just by subscribing to our plastiCircle</p>
                        <form>
                            <input type="email" placeholder="Enter your email" className="newsletter-input" />
                            <button type="submit" className="newsletter-button">Subscribe</button>
                        </form>
                        <p className="small-text">
                            You will be able to unsubscribe at any time. Read our <a href="/privacy-policy">privacy policy</a> here.
                        </p>
                    </div>
                </div>
                <div className="newsletter-content"><img src="/images/Clipped_image_20250325_154113.png" 
                    alt="Vacuum Cleaner" className="newsletter-image2" />
                </div>
                <div className="newsletter-content"><img src="/images/plant3.png" 
                    alt="Vacuum Cleaner" className="newsletter-image3" />
                </div>

            </div>

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
                        <li><a href="/courses">Courses</a></li>
                        <li><a href="/become-teacher">Stay Connected</a></li>
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
                <nav>
                    <ul>
                        <li><a href="/privacy-policy">Privacy Policy</a></li>
                        <li><a href="/terms-of-use">Terms of Use</a></li>
                        <li><a href="/legal">Legal</a></li>
                        <li><a href="/sitemap">Goals</a></li>
                    </ul>                    
                    <ul>
                    <div className="social-icons">
                        <a href="#"><FontAwesomeIcon icon={faFacebook} /></a>
                        <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
                        <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
                        <a href="#"><FontAwesomeIcon icon={faLinkedin} /></a>
                        <a href="#"><FontAwesomeIcon icon={faYoutube} /></a>
                    </div>
                    </ul>
                </nav>
               
            </div>
        </footer>
    );
};

export default Footer;
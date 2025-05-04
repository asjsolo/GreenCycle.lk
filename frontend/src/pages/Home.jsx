// frontend/pages/Home.jsx
import React from "react";
import "./Home.css"; // Create this CSS file for styling
import { Link } from "react-router-dom"; // Import Link for navigation

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Join the Movement to End Plastic Pollution</h1>
          <p>
            GreenCycle.lk empowers you to track, reduce, recycle, and earn
            rewards for proper plastic disposal. Make a real impact on our
            planet, one action at a time.
          </p>
          <Link to="/register" className="cta-button">
            Get Started Today!
          </Link>{" "}
          {/* Call to Action button */}
        </div>
        {/* Optional: Add an image or illustration related to plastic reduction */}
        {/* <div className="hero-image">
             <img src="/images/hero-plastic-reduction.png" alt="Plastic Reduction Illustration" />
        </div> */}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {/* Feature 1: Plastic Footprint Calculator */}
          <div className="feature-item">
            <h3>Plastic Footprint Calculator</h3>
            <p>
              Measure your personal plastic usage and understand your impact.
            </p>
            {/* Optional: Link to calculator if public */}
            <Link to="/plasticFootprintCalculator">Learn More</Link>
          </div>

          {/* Feature 2: Eco Action Tracker */}
          <div className="feature-item">
            <h3>Eco Action Tracker</h3>
            <p>
              Log your daily eco-friendly actions and build sustainable habits.
            </p>
            {/* Optional: Link to dashboard/tracker if public preview available */}
            {/* <Link to="/dashboard/ecoActionTracker">Track Actions</Link> */}
          </div>

          {/* Feature 3: Awareness Hub */}
          <div className="feature-item">
            <h3>Awareness Hub</h3>
            <p>
              Access educational resources on sustainable alternatives and
              environmental issues.
            </p>
            {/* Optional: Link to Awareness Hub if public */}
            <Link to="/awareness-hub">Explore Resources</Link>
          </div>

          {/* Feature 4: Recycling Directory */}
          <div className="feature-item">
            <h3>Recycling Directory</h3>
            <p>Find local recycling centers near you for proper disposal.</p>
            {/* Optional: Link to Directory if public */}
            <Link to="/recycling-directory">Find Centers</Link>
          </div>

          {/* Feature 5: Community Forum */}
          <div className="feature-item">
            <h3>Community Forum</h3>
            <p>
              Connect with others, share tips, and participate in challenges.
            </p>
            {/* Optional: Link to Forum if public */}
            {/* <Link to="/community-forum">Join Forum</Link> */}
          </div>

          {/* Feature 6: Analytical Dashboard */}
          <div className="feature-item">
            <h3>Personal Dashboard & Analytics</h3>
            <p>
              Visualize your progress, track achievements, and see your impact
              over time.
            </p>
            {/* Optional: Link to Dashboard if public preview available */}
            {/* <Link to="/dashboard">View Dashboard</Link> */}
          </div>
        </div>
      </section>

      {/* Call to Action Section (Optional - can be part of Hero or separate) */}
      <section className="cta-section">
        <h2>Ready to Make a Difference?</h2>
        <p>
          Join thousands of users reducing their plastic footprint with
          GreenCycle.lk.
        </p>
        <Link to="/register" className="cta-button secondary">
          Sign Up Free
        </Link>
      </section>

      {/* Optional: Add a section for testimonials, impact numbers, or partners */}
      {/* <section className="impact-section">
            <h2>Our Impact</h2>
            <p>Showcase statistics or user testimonials here.</p>
       </section> */}
    </div>
  );
}

export default Home;

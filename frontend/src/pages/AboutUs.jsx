// frontend/pages/AboutUs.jsx
import React from "react";
import "./AboutUs.css"; // Create this CSS file for styling

function AboutUs() {
  return (
    <div className="about-us-page">
      <header className="about-us-header">
        <h1>About GreenCycle.lk</h1>
        <p>
          Empowering communities to combat plastic pollution through technology
          and collective action.
        </p>
      </header>

      <section className="about-us-mission">
        <h2>Our Mission</h2>
        <p>
          Our mission is to reduce plastic waste and promote sustainable
          practices by providing individuals and communities with accessible
          tools, educational resources, and a supportive platform to track their
          impact and connect with others.
        </p>
      </section>

      <section className="about-us-story">
        <h2>Our Story</h2>
        <p>
          GreenCycle.lk was born out of a shared concern for the growing plastic
          pollution crisis and the desire to create a tangible solution. We
          believe that by making it easier for people to understand their
          plastic footprint, find recycling options, learn about alternatives,
          and engage with a like-minded community, we can collectively make a
          significant difference.
        </p>
        <p>
          This platform is a university project developed by a dedicated team
          passionate about environmental sustainability and leveraging
          technology for good.
        </p>
      </section>

      {/* Optional: Add a Meet the Team section */}
      {/* <section className="about-us-team">
          <h2>Meet the Team</h2>
          <div className="team-members">
              // Add team member photos and brief bios here
              <div className="team-member">
                  <img src="/images/team-member-1.jpg" alt="Team Member 1" />
                  <h3>[Name]</h3>
                  <p>[Role/Contribution]</p>
              </div>
              // Repeat for other team members
          </div>
      </section> */}

      {/* Optional: Add a section about Project Goals or Future Plans */}
      {/* <section className="about-us-future">
           <h2>Our Goals</h2>
           <p>Outline future plans, features, or long-term vision.</p>
       </section> */}
    </div>
  );
}

export default AboutUs;

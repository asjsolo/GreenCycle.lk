// frontend/pages/ContactUs.jsx
import React, { useState } from "react";
import "./ContactUs.css"; // Create this CSS file for styling

function ContactUs() {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // State for form submission feedback
  const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
  const [submitMessage, setSubmitMessage] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear status messages when user starts typing again
    setSubmitStatus(null);
    setSubmitMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setSubmitStatus("error");
      setSubmitMessage("Please fill in all fields.");
      return;
    }

    // Basic email format validation (can add more robust validation if needed)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter a valid email address.");
      return;
    }

    setSubmitStatus("loading");
    setSubmitMessage("Sending message...");

    console.log("Attempting to send contact form data:", formData); // Debug log

    try {
      // --- Backend Endpoint for Contact Form ---
      // NOTE: You will need to create a backend endpoint (e.g., POST /api/contact)
      // to receive this data and send an email (e.g., using Nodemailer).
      // For now, this fetch call will likely fail unless that endpoint exists.
      const response = await fetch("/api/contact", {
        // Replace with your actual backend endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Contact form submission response:", data); // Debug log

      if (response.ok) {
        // Assuming backend returns 200 OK on success
        setSubmitStatus("success");
        setSubmitMessage(
          data.message || "Your message has been sent successfully!"
        );
        // Clear the form after successful submission
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        // Handle backend errors (e.g., validation errors, server issues)
        setSubmitStatus("error");
        setSubmitMessage(
          data.message || "Failed to send your message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending contact form:", error); // Log the error
      setSubmitStatus("error");
      setSubmitMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="contact-us-page">
      <header className="contact-us-header">
        <h1>Get in Touch</h1>
        <p>
          Have questions, feedback, or suggestions? We'd love to hear from you!
        </p>
      </header>

      <section className="contact-form-section">
        <h2>Send us a Message</h2>

        {/* Submission Status Message */}
        {submitStatus && (
          <div className={`contact-us-submit-message ${submitStatus}`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={submitStatus === "loading"}
              required // HTML5 validation
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Your Email:</label>
            <input
              type="email" // Use type="email" for better mobile keyboards and basic validation
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={submitStatus === "loading"}
              required
            />
          </div>

          {/* Subject Field */}
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={submitStatus === "loading"}
              required
            />
          </div>

          {/* Message Field */}
          <div className="form-group">
            <label htmlFor="message">Your Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={submitStatus === "loading"}
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" disabled={submitStatus === "loading"}>
              {submitStatus === "loading" ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </section>

      {/* Optional: Add Contact Information Section */}
      {/* <section className="contact-info-section">
           <h2>Contact Information</h2>
           <p>Email: info@greencycle.lk</p>
           <p>Phone: +94 11 123 4567</p>
           <p>Address: [Your Address Here]</p>
           // Optional: Add a map embed
       </section> */}
    </div>
  );
}

export default ContactUs;

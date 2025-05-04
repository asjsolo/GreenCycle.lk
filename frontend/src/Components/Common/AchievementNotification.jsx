// frontend/Components/Common/AchievementNotification.jsx
import React, { useEffect, useState } from "react";
import "./AchievementNotification.css"; // Create this CSS file for styling

function AchievementNotification({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Show the notification when the component mounts or achievement prop changes
  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Automatically hide the notification after a few seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Call onClose after hiding, so the parent can clear the state
        setTimeout(onClose, 500); // Allow time for fade-out transition
      }, 4000); // Display for 4 seconds

      // Cleanup the timer if the component unmounts or achievement changes
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]); // Depend on achievement and onClose

  if (!isVisible || !achievement) {
    return null; // Don't render if not visible or no achievement data
  }

  // Get achievement details
  const { name, description, badgeImageUrl } = achievement;
  const badgeSrc = badgeImageUrl || "/images/badges/default.png"; // Use default if no image

  return (
    // Use a class for the notification container
    // Position it fixed on the screen (e.g., bottom-right)
    // Add classes for show/hide animations
    <div className={`achievement-notification ${isVisible ? "show" : "hide"}`}>
      <div className="notification-content">
        <div className="notification-badge">
          <img src={badgeSrc} alt={`${name} Badge`} className="badge-image" />
        </div>
        <div className="notification-details">
          <h4 className="notification-title">Achievement Earned!</h4>
          <p className="notification-name">{name}</p>
          <p className="notification-description">{description}</p>
        </div>
        {/* Optional: Add a close button */}
        {/* <button className="notification-close" onClick={() => setIsVisible(false)}>X</button> */}
      </div>
    </div>
  );
}

export default AchievementNotification;

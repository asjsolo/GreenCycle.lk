//MADE CSS EDITS
// frontend/Components/Common/AchievementNotification.jsx
import React, { useEffect, useState } from "react";
import "./AchievementNotification.css"; // Create this CSS file for styling
import { useAchievementNotification } from "../../context/AchievementNotificationContext"; // Import the hook
import { badgeImageMap } from "../../pages/user-dashboard/achievements-badges/AchievementCard.jsx"; // Adjust path if needed

function AchievementNotification({}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null); // State for the achievement currently being displayed

  // --- Get state and dismiss function from context ---
  const { achievementsToNotify, dismissNotification } =
    useAchievementNotification();

  // Effect to show the next notification in the queue
  useEffect(() => {
    // If there are achievements in the queue and no notification is currently visible
    if (achievementsToNotify.length > 0 && !isVisible) {
      const nextAchievement = achievementsToNotify[0];
      setCurrentAchievement(nextAchievement); // Set the achievement to display
      setIsVisible(true); // Show the notification

      // Automatically hide after a delay
      const timer = setTimeout(() => {
        setIsVisible(false); // Start fade-out animation
        // Wait for fade-out and then dismiss the notification from the context queue
        setTimeout(dismissNotification, 500); // 500ms matches the CSS transition duration
      }, 4000); // Display for 4 seconds

      // Cleanup timer
      return () => clearTimeout(timer);
    }
  }, [achievementsToNotify, isVisible, dismissNotification]); // Depend on queue, visibility, and dismiss function

  // Don't render if no achievement is being displayed
  if (!isVisible || !currentAchievement) {
    return null;
  }

  // Get achievement details
  const { name, description, badgeFilename } = currentAchievement;
  const badgeSrc = badgeFilename
    ? badgeImageMap[badgeFilename]
    : "/images/badges/default.png"; // Use the map

  return (
    <div className={`achievement-notification ${isVisible ? "show" : "hide"}`}>
      <div className="achievement-notification-content">
        <div className="achievement-notification-badge">
          <img
            src={badgeSrc} // Use the source from the map
            alt={`${name} Badge`}
            className="achievement-badge-image"
          />
        </div>
        <div className="achievement-notification-details">
          <h4 className="achievement-notification-title">
            Achievement Earned!
          </h4>
          <p className="achievement-notification-name">{name}</p>
          <p className="achievement-notification-description">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default AchievementNotification;

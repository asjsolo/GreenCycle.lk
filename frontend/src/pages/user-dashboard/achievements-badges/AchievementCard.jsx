import React from "react";
import "./AchievementCard.css";

function AchievementCard({ achievement }) {
  // Receives an achievement object from the combined list
  const {
    name,
    description,
    badgeImageUrl, // URL to the badge image
    criteria, // The criteria object { type, threshold, keywords }
    isEarned, // Boolean indicating if earned by the user
    earnedDate, // Date if earned (or null)
    currentProgress, // Placeholder progress (needs backend data)
    totalNeeded, // Total needed for criteria (from definition)
    tier, // Optional tier
    bonusType, // Optional bonus type
  } = achievement;

  // Determine badge source - maybe a default grey version if not earned?
  // For simplicity, let's assume badgeImageUrl always points to the earned image
  // You might need a grey_badgeImageUrl in your definitions for unearned state
  const badgeSrc = badgeImageUrl || "/images/badges/default.png"; // Use a default if URL is missing
  const greyBadgeSrc =
    badgeSrc.replace(".png", "_grey.png") || "/images/badges/default_grey.png"; // Example: Assume grey versions exist

  // Calculate percentage for progress bar (handle division by zero)
  const progressPercentage =
    totalNeeded && totalNeeded > 0
      ? Math.min((currentProgress / totalNeeded) * 100, 100) // Progress capped at 100%
      : 0; // Default 0% if no total needed or total is 0

  return (
    // Main card container - use class for styling
    <div className={`achievement-card ${isEarned ? "earned" : "unearned"}`}>
      {" "}
      {/* Use specific classes 'earned'/'unearned' */}
      {/* Badge Image Area */}
      <div className="achievement-card-badge">
        {" "}
        {/* Specific class for badge area */}
        <img
          src={isEarned ? badgeSrc : greyBadgeSrc}
          alt={`${name} ${isEarned ? "Earned" : "Not Earned"} Badge`}
          className={`badge-image ${!isEarned ? "grayscale" : ""}`}
        />
      </div>
      {/* Achievement Details Area */}
      <div className="achievement-card-details">
        {" "}
        {/* Specific class for details area */}
        {/* Name */}
        <h3 className="achievement-card-name">{name}</h3>{" "}
        {/* Use class for name */}
        {/* Description */}
        <p className="achievement-card-description">{description}</p>{" "}
        {/* Use class for description */}
        {/* Status or Progress Area */}
        {isEarned ? (
          // Display earned date if earned
          <p className="achievement-card-earned-date">
            {" "}
            {/* Use class for earned date */}
            Earned on{" "}
            {earnedDate
              ? new Date(earnedDate).toLocaleDateString()
              : "Unknown Date"}
          </p>
        ) : (
          // Display progress or "Not Earned Yet" if unearned
          <div className="achievement-card-progress-area">
            {" "}
            {/* Specific class for progress area */}
            <p className="achievement-card-status">Not Earned Yet</p>{" "}
            {/* Use class for status */}
            {/* Progress Bar Container (Show only for criteria with a defined totalNeeded) */}
            {totalNeeded &&
              totalNeeded > 0 &&
              criteria.type === "actionCount" && (
                <div className="progress-bar-container">
                  {" "}
                  {/* Use class for container */}
                  <div
                    className="progress-bar"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>{" "}
                  {/* Use class for the bar */}
                </div>
              )}
            {/* Progress Text (Show current/total for relevant criteria) */}
            {totalNeeded &&
              totalNeeded > 0 &&
              criteria.type === "actionCount" && (
                <p className="progress-text">
                  {currentProgress} / {totalNeeded}
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementCard;

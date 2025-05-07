// frontend/src/context/AchievementNotificationContext.js
import React, { createContext, useState, useContext } from "react";

// Create the context
const AchievementNotificationContext = createContext();

// Create a provider component
export const AchievementNotificationProvider = ({ children }) => {
  // State to hold the achievement(s) to display in the notification
  // We use an array because multiple achievements could theoretically be earned at once
  const [achievementsToNotify, setAchievementsToNotify] = useState([]);

  // Function to show a notification for one or more achievements
  // This function will be called by components when achievements are awarded
  const showAchievementNotification = (achievements) => {
    // Ensure 'achievements' is always an array
    const achievementsArray = Array.isArray(achievements)
      ? achievements
      : [achievements];

    // Add the new achievements to the queue
    setAchievementsToNotify((prevAchievements) => [
      ...prevAchievements,
      ...achievementsArray,
    ]);
  };

  // Function to remove the oldest achievement from the queue after it's displayed/closed
  const dismissNotification = () => {
    setAchievementsToNotify((prevAchievements) => prevAchievements.slice(1)); // Remove the first item
  };

  // The value provided to consumers of this context
  const contextValue = {
    achievementsToNotify, // Array of achievements waiting to be notified
    showAchievementNotification, // Function to trigger a notification
    dismissNotification, // Function to dismiss the current notification
  };

  return (
    <AchievementNotificationContext.Provider value={contextValue}>
      {children}
    </AchievementNotificationContext.Provider>
  );
};

// Custom hook to use the achievement notification context
export const useAchievementNotification = () => {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error(
      "useAchievementNotification must be used within an AchievementNotificationProvider"
    );
  }
  return context;
};

export default AchievementNotificationContext; // Export the context itself as well

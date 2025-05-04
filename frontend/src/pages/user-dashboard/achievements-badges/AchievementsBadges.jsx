// In frontend/pages/user-dashboard/achievements-badges/AchievementsBadges.jsx

import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../context/AuthContext";
import "./AchievementsBadges.css";
import AchievementCard from "./AchievementCard";

function AchievementsBadges() {
  // We only need state for the final combined list now
  const [achievementsList, setAchievementsList] = useState([]); // State for the combined list from backend
  // const [allAchievements, setAllAchievements] = useState([]); // State for all definitions (No longer needed as separate state)
  // const [userAchievements, setUserAchievements] = useState([]); // State for user's earned achievements (No longer needed as separate state)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);

  // --- Fetch Achievements Data on Mount ---
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) {
        setLoading(false);
        setError("User not authenticated.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the combined list of achievements from the updated backend endpoint
        // This endpoint now returns all definitions merged with user status and progress
        console.log("Fetching combined achievement data..."); // Debug log
        const response = await fetch("/api/dashboard/achievements", {
          // <<< Still using the same endpoint name, but backend logic is changed
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(
              errorData.message || "Failed to fetch achievements"
            );
          }
          console.error(
            "Fetch achievements failed due to auth:",
            response.status,
            errorData.message
          );
          setError("Authentication required to view achievements.");
        } else {
          const data = await response.json();
          setAchievementsList(data); // Set the combined list directly
          setError(null);
          console.log("Successfully fetched combined achievements data:", data); // Debug log
        }
      } catch (err) {
        console.error("Error fetching achievements data:", err);
        setError("Failed to load achievements. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  // --- Removed: Frontend Logic to Combine Definitions and User's Earned Achievements ---
  // This logic is now handled by the backend's getUserAchievements controller.
  /*
  const combinedAchievements = allAchievements.map(definition => {
      // ... (merging logic) ...
  });
  // Optional: Sort achievements (sorting should ideally happen in the backend now)
   combinedAchievements.sort((a, b) => {
      // ... (sorting logic) ...
   });
   */

  // --- Render Logic ---
  if (loading) {
    return <div className="p-6 text-center">Loading achievements...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading achievements: {error}
      </div>
    );
  }

  return (
    <div className="achievements-page p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-6">All Achievements</h2>

      <div className="achievements-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Map over the combined list received from the backend */}
        {achievementsList.map((achievement) => (
          // Pass the achievement object (which now includes progress) to AchievementCard
          <AchievementCard key={achievement.name} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

export default AchievementsBadges;

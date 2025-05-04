// frontend/pages/user-dashboard/leaderboards/Leaderboard.jsx
import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../context/AuthContext"; // Adjust path as needed
import "./Leaderboard.css"; // Create this CSS file for styling

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We don't strictly need the 'user' context here to fetch the leaderboard,
  // as the backend endpoint is protected and doesn't require the specific user ID in the request body/params.
  // However, we might need it later if we want to highlight the current user's rank.
  const { user } = useContext(AuthContext);

  // --- Fetch Leaderboard Data on Mount ---
  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Optional: Check if user is defined if you need their ID for highlighting etc.
      // if (!user) { setLoading(false); setError("Authentication needed."); return; }

      try {
        setLoading(true);
        setError(null);
        console.log("LeaderboardPage: Fetching leaderboard data..."); // Debug log

        const response = await fetch("/api/dashboard/leaderboard", {
          // Fetch from the new endpoint
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Needed as the endpoint is protected
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(
              errorData.message || "Failed to fetch leaderboard data"
            );
          }
          console.error(
            "LeaderboardPage: Fetch data failed due to auth:",
            response.status,
            errorData.message
          );
          setError("Authentication required to view the leaderboard."); // Or specific error
        } else {
          const data = await response.json();
          console.log(
            "LeaderboardPage: Successfully fetched leaderboard data:",
            data
          ); // Debug log
          // Data is an array like [{ userId: '...', totalCompletedActions: N, userName: '...' }, ...]
          setLeaderboardData(data); // Store the fetched data
        }
      } catch (err) {
        console.error("LeaderboardPage: Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Depend on user if you need to re-fetch when user changes (e.g., highlight changes)
  }, []); // Empty dependency array: runs once on mount

  // --- Render Logic ---
  if (loading) {
    return <div className="p-6 text-center">Loading leaderboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading leaderboard: {error}
      </div>
    );
  }

  // Check if leaderboard data is empty
  const hasLeaderboardData = leaderboardData && leaderboardData.length > 0;

  return (
    <div className="leaderboard-page p-6 bg-white rounded shadow">
      {" "}
      {/* Main container */}
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
      {!hasLeaderboardData ? (
        <p className="text-gray-500">
          No leaderboard data available yet. Complete some actions to see your
          rank!
        </p>
      ) : (
        <table className="leaderboard-table w-full">
          {" "}
          {/* Use a table for layout */}
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">User</th>
              <th className="text-right">Completed Actions</th>{" "}
              {/* Align count right */}
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr
                key={entry.userId}
                className={`border-b last:border-b-0 ${
                  user && user._id === entry.userId
                    ? "bg-blue-100 font-bold"
                    : ""
                }`}
              >
                {" "}
                {/* Highlight current user */}
                <td className="py-2">{index + 1}</td> {/* Rank is index + 1 */}
                <td className="py-2">{entry.userName}</td>{" "}
                {/* Display user name */}
                <td className="py-2 text-right">
                  {entry.totalCompletedActions}
                </td>{" "}
                {/* Display count, align right */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Need to add a route for this component in index.js (Already exists based on user's index.js)

export default Leaderboard;

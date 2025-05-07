// frontend/pages/user-dashboard/dashboard-summary/DashboardSummary.jsx
//ORIGINAL
import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import "./DashboardSummary.css"; // Create this CSS file
import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";
// Optional: Import a Modal component if you want to display the report in a modal
import ReportModal from "../../Components/Common/ReportModal";

function DashboardSummary() {
  const { user } = useContext(AuthContext);

  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  // --- State for Report Generation ---
  const [reportLoading, setReportLoading] = useState(false); // Loading state for report button
  const [reportError, setReportError] = useState(null); // Error state for report generation
  const [weeklyReportData, setWeeklyReportData] = useState(null); // State to hold the generated report data
  const [showReportModal, setShowReportModal] = useState(false); // State to control modal visibility

  // --- Fetch User Statistics ---
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setStatsLoading(false);
        setStatsError("User not authenticated.");
        return;
      }
      try {
        setStatsLoading(true);
        setStatsError(null);
        console.log("DashboardSummary: Fetching user statistics...");

        const response = await fetch("/api/dashboard/stats", {
          // Fetch from the stats endpoint
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(
              errorData.message || "Failed to fetch user statistics"
            );
          }
          console.error(
            "DashboardSummary: Fetch stats failed due to auth:",
            response.status,
            errorData.message
          );
          setStatsError("Authentication required to view stats.");
        } else {
          const data = await response.json();
          console.log(
            "DashboardSummary: Successfully fetched user statistics:",
            data
          );
          // Assuming backend now returns { success: true, stats: { dayStreak: N, totalXP: N, completedActionsToday: N, ecoScoreTrend: {...}, ... } }
          if (data.success && data.stats) {
            setUserStats(data.stats); // Set the fetched stats
          } else {
            setStatsError(data.message || "Failed to load user statistics.");
          }
        }
      } catch (err) {
        console.error("DashboardSummary: Error fetching user statistics:", err);
        setStatsError("Failed to load statistics. Please try again.");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // --- Handle Generate Weekly Report Button Click ---
  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError(null);
    setWeeklyReportData(null); // Clear previous report data

    console.log("DashboardSummary: Generating weekly report..."); // Debug log

    try {
      const response = await fetch("/api/dashboard/generate-weekly-report", {
        // Call the new backend endpoint
        method: "POST", // Use POST
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // No body needed for this simple weekly report
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status !== 401 && response.status !== 403) {
          throw new Error(
            errorData.message || "Failed to generate weekly report"
          );
        }
        console.error(
          "DashboardSummary: Generate report failed due to auth:",
          response.status,
          errorData.message
        );
        setReportError("Authentication required to generate report.");
      } else {
        const data = await response.json();
        console.log(
          "DashboardSummary: Successfully generated weekly report data:",
          data
        );
        if (data.success && data.report) {
          setWeeklyReportData(data.report); // Store the generated report data
          setShowReportModal(true); // Optional: Show a modal to display the report
        } else {
          setReportError(
            data.message || "Failed to generate weekly report data."
          );
        }
      }
    } catch (err) {
      console.error("DashboardSummary: Error generating weekly report:", err);
      setReportError("Failed to generate report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  // --- Function to close Report Modal (if using one) ---
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    // Optional: Clear report data when modal closes: setWeeklyReportData(null);
    console.log("Report modal closed.");
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        Please log in to view your dashboard.
      </div>
    );
  }

  if (statsLoading) {
    return <div className="p-6 text-center">Loading user statistics...</div>;
  }

  if (statsError) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading statistics: {statsError}
      </div>
    );
  }

  // Access the ecoScoreTrend data if available
  const ecoScoreTrend = userStats?.ecoScoreTrend;

  return (
    <div className="dashboard-summary-page">
      {" "}
      {/* Main container */}
      <h2 className="dashboard-heading">Dashboard Summary</h2>
      {/* User Profile Info (already in layout header, but could repeat or add more here) */}
      {/* You might just rely on the header in UserDashboardLayout */}
      <div className="user-summary-profile">
        {/*<h3 className="profile-welcome-heading">Welcome, {user.name}!</h3>*/}
        {/*  Add user avatar, join date etc.*/}
      </div>
      {/* Statistics Section (similar to Duolingo) */}
      <div className="user-statistics">
        <div className="stat-card">
          <h4 className="stat-title">Day Streak</h4>
          <p className="stat-value text-blue-600">
            {userStats?.dayStreak || 0}
          </p>{" "}
          {/* Display calculated streak */}
          {/* Add streak icon */}
        </div>
        {/*<div className="stat-card">
          <h4 className="stat-title">Total XP</h4>
          <p className="stat-value text-green-600">
            {userStats?.totalXP || 0}
          </p>{" "}
          {/* Display calculated/placeholder XP */}
        {/* Add XP icon */}
        {/*</div>*/}
        <div className="stat-card">
          <h4 className="stat-title">Completed Today</h4>
          <p className="stat-value text-purple-600">
            {userStats?.completedActionsToday || 0}
          </p>{" "}
          {/* Display completed today count */}
        </div>
        {/* Add more stat cards: e.g., Badges Earned */}
        <div className="stat-card">
          <h4 className="stat-title">Badges Earned</h4>
          <p className="stat-value text-yellow-600">
            {userStats?.totalBadgesEarned || 0}
          </p>{" "}
          {/* Display total badges earned */}
        </div>
      </div>
      {/* Eco-Score Trend Display */}
      {ecoScoreTrend && ( // Only display if trend data is available
        <div className="eco-score-trend-display">
          {" "}
          {/* Style this section */}
          <h3 className="trend-heading">Eco-Score Trend</h3>
          <p className="trend-summary">
            Your completed actions this week:{" "}
            <span className="font-bold">{ecoScoreTrend.currentWeekCount}</span>
            {" | "}
            Last week:{" "}
            <span className="font-bold">{ecoScoreTrend.lastWeekCount}</span>
          </p>
          <p
            className={`trend-percentage ${
              ecoScoreTrend.trendDirection === "up"
                ? "text-green-600"
                : ecoScoreTrend.trendDirection === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {" "}
            {/* Style based on trend */}
            {/* Display trend icon if you install react-icons */}
            {ecoScoreTrend.trendDirection === "up" && (
              <FiArrowUp className="inline-block mr-1" />
            )}
            {ecoScoreTrend.trendDirection === "down" && (
              <FiArrowDown className="inline-block mr-1" />
            )}
            {ecoScoreTrend.trendDirection === "same" && (
              <FiMinus className="inline-block mr-1" />
            )}
            {ecoScoreTrend.percentageChange}%
            {ecoScoreTrend.trendDirection === "up" && " Increase"}
            {ecoScoreTrend.trendDirection === "down" && " Decrease"}
            {ecoScoreTrend.trendDirection === "same" && " (No Change)"}
            {" this week"}
          </p>
        </div>
      )}
      {/* --- Generate Report Section --- */}
      <div className="generate-report-section">
        {" "}
        {/* Style this section */}
        <h3 className="report-heading">Weekly Report</h3>
        <p className="report-description">
          Generate a summary of your eco activity for the last week.
        </p>
        <button
          onClick={handleGenerateReport} // Trigger the report generation function
          className="report-button"
          disabled={reportLoading} // Disable button while loading
        >
          {reportLoading ? "Generating Report..." : "Generate Weekly Report"}
        </button>
        {/* Display report error message */}
        {reportError && <p className="report-error-message">{reportError}</p>}
        {/* Optional: Display report data directly or trigger modal */}
        {/* For now, we'll just log it to console after successful generation */}
      </div>
      {/* Optional: Render Report Modal */}
      {/* If you created a ReportModal component and show/hide logic */}
      {showReportModal && weeklyReportData && (
        <ReportModal
          reportData={weeklyReportData}
          onClose={handleCloseReportModal}
        />
      )}
      {/* Recent Activity / Badge Showcase Section */}
      {/* You might fetch recent activity or a few earned badges here */}
      {/*<div className="recent-activity-badges">
      <h3 className="recent-activity-heading">Recent Activity / Badges</h3>
      {/* Fetch and display recent actions or a selection of badges*/}
      {/*</div>*/}
    </div>
  );
}

export default DashboardSummary;

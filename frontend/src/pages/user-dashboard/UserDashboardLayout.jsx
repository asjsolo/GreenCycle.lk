// UserDashboardLayout.jsx
import React, { useContext } from "react"; // Import useContext
import { Link, Outlet } from "react-router-dom";
import MainLayout from "../../Components/Layout/MainLayout";
import AuthContext from "../../context/AuthContext";
import "./UserDashboardLayout.css"; // Import the CSS file

// Import the Achievement Notification components and context
import AchievementNotification from "../../Components/Common/AchievementNotification";
import {
  AchievementNotificationProvider,
  useAchievementNotification,
} from "../../context/AchievementNotificationContext";

// --- Component that Renders the Layout and Notification ---
function UserDashboardLayoutContent() {
  // Renamed the main component
  const { user, authLoading } = useContext(AuthContext); // Get user from context
  const { achievementsToNotify, dismissNotification } =
    useAchievementNotification(); // Use the notification context
  if (authLoading) {
    return <div className="text-center p-6">Loading dashboard layout...</div>;
  }

  return (
    <>
      {/* Apply dashboard-container class */}
      <div className="dashboard-container">
        {" "}
        {/* Removed 'flex' as display:flex is in CSS */}
        {/* Sidebar Navigation - Apply dashboard-sidebar class */}
        <div className="dashboard-sidebar">
          {" "}
          {/* Removed Tailwind classes */}
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>{" "}
          {/* Keep basic Tailwind classes for quick styling */}
          <ul className="space-y-2">
            {" "}
            {/* Keep basic Tailwind classes */}
            <li>
              <Link
                to="ecoActionTracker"
                className="sidebar-link" // Use custom CSS class
              >
                Eco Action Tracker
              </Link>
            </li>
            <li>
              <Link
                to="leaderboard"
                className="sidebar-link" // Use custom CSS class
              >
                Leaderboard
              </Link>
            </li>
            <li>
              <Link
                to="achievementsBadges"
                className="sidebar-link" // Use custom CSS class
              >
                Achievements
              </Link>
            </li>
            <li>
              <Link
                to="analytics"
                className="sidebar-link" // Use custom CSS class
              >
                Analytics
              </Link>
            </li>
            {/* Link to the default index route for the dashboard parent */}
            <li>
              <Link
                to="/dashboard" // Use absolute path for clarity or relative "."
                // Use relative path "." if you want it to link to the index of the current parent route
                // to="." // Recommended relative path for index
                className="sidebar-link" // Use custom CSS class
              >
                Dashboard Summary
              </Link>
            </li>
            <li>
              <Link
                to="profile" // Relative path within /dashboard
                className="sidebar-link"
              >
                User Profile
              </Link>
            </li>
            {/* Add more navigation links here */}
          </ul>
        </div>
        {/* Main Content Area - Apply dashboard-main-content class */}
        <div className="dashboard-main-content">
          {" "}
          {/* Removed Tailwind classes */}
          {/* Top Profile Area - Apply dashboard-profile-header class */}
          <div className="dashboard-profile-header">
            {" "}
            {/* Removed Tailwind classes */}
            {/* Display user details from AuthContext */}
            <h3 className="text-lg font-semibold">
              Welcome, {user ? user.name : "[User]"}!
            </h3>{" "}
            {/* Use user from context */}
            {/* Add more user profile info here (e.g., badges summary) */}
            {/* You can add an avatar here */}
            {/* <img src={user?.avatarUrl || '/images/default-avatar.png'} alt="User Avatar" className="w-12 h-12 rounded-full mr-4" /> */}
          </div>
          {/* This is where the content of the matched child route will be rendered */}
          <Outlet />
        </div>
        {/* Optional Right Sidebar */}
        {/* You could add another div here with classes like 'dashboard-right-sidebar' */}
        {/* ... */}
      </div>

      {/* --- Render Achievement Notification --- */}
      {/* Display the oldest achievement in the queue */}
      {achievementsToNotify.length > 0 && (
        <AchievementNotification
          achievement={achievementsToNotify[0]} // Pass the first achievement in the queue
          onClose={dismissNotification} // Call dismiss when the notification closes
        />
      )}
    </>
  );
}

// --- Wrapper Component with MainLayout (AchievementProvider is now higher) ---\r\n
// This component wraps the layout content with the MainLayout\r\n
function UserDashboardLayout() {
  return (
    <MainLayout>
      {" "}
      {/* Keep MainLayout as the outer wrapper */}
      {/* --- REMOVED: AchievementNotificationProvider is now in index.js --- */}
      {/* <AchievementNotificationProvider> */}
      <UserDashboardLayoutContent />{" "}
      {/* Render the layout content inside MainLayout */}
      {/* </AchievementNotificationProvider> */}
    </MainLayout>
  );
}
export default UserDashboardLayout;

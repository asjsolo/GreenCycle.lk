//UserDashboard.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import MainLayout from "../../Components/Layout/MainLayout";

function UserDashboard() {
  return (
    <MainLayout>
      <div className="mini-navbar">
        <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>

        {/* Mini Navbar Inside Dashboard */}
        <ul className="mini-navbar-menu">
          <li>
            <Link to="ecoTracker" className="text-blue-500">
              Eco Action Tracker
            </Link>
          </li>

          <li>
            <Link to="leaderboard" className="text-blue-500">
              Leaderboard
            </Link>
          </li>
          <li>
            <Link to="achievementsBadges" className="text-blue-500">
              Achievements
            </Link>
          </li>
        </ul>

        {/* This will load the selected page inside Dashboard */}
        <Outlet />
      </div>
    </MainLayout>
  );
}

export default UserDashboard;

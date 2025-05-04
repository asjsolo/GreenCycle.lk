// MainLayout.jsx
import React from "react";
// REMOVED: import Navbar from "../Common/Navbar"; // Remove Navbar import

function MainLayout({ children }) {
  return (
    // This layout renders the children passed to it.
    // The Navbar is handled by the higher-level App.js component.
    <div className="h-screen flex flex-col">
      {/* REMOVED: <Navbar /> /} {/ Remove Navbar rendering */}
      <div className="flex-1 overflow-y-auto">
        {/* The content passed to MainLayout (e.g., UserDashboardLayout content) is rendered here */}
        {children}
      </div>
    </div>
  );
}

export default MainLayout;
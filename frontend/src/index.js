//USED AUTHLAYOUT
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; // Your main wrapper component
import Home from "./pages/Home"; // Public Home/Landing page
import Register from "./Components/Common/Register";
import Login from "./Components/Common/Login";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import ResetPassword from "./Components/Auth/ResetPassword";
import AboutUs from "./pages/AboutUs";
import PlasticFootprintCalculator from "./pages/plastic-footprint-calculator/PlasticFootprintCalculator"; // Assuming public
import UserDashboardLayout from "./pages/user-dashboard/UserDashboardLayout"; // Renamed for clarity
import AchievementsBadges from "./pages/user-dashboard/achievements-badges/AchievementsBadges"; // Component for achievements content
import Leaderboard from "./pages/user-dashboard/leaderboards/Leaderboard"; // Component for leaderboard content
import EcoActionTracker from "./pages/user-dashboard/eco-tracker/EcoActionTracker"; // Component for eco tracker content
import DashboardSummary from "./pages/user-dashboard/DashboardSummary";
import AnalyticsPage from "./pages/user-dashboard/analytics/AnalyticsPage";

import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Import Outlet
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import VerifyEmail from "./Components/Auth/VerifyEmail"; // Verification page component
import UserProfile from "./pages/user-dashboard/user-profile/UserProfile";
import ContactUs from "./pages/ContactUs";
import AuthLayout from "./Components/Layout/AuthLayout";

// Import the Achievement Notification Provider
import { AchievementNotificationProvider } from "./context/AchievementNotificationContext";

// Define your router configuration
const router = createBrowserRouter([
  {
    // This is the main application structure
    // App component can render common elements like Navbar, Footer, etc.
    // And render an <Outlet /> for the routes defined below
    path: "/",
    element: <App />, // Your main App component
    children: [
      // --- Public Routes ---
      {
        index: true, // Renders at the exact parent path "/"
        element: <Home />, // Your landing page
        // Alternative: { index: true, element: <Navigate to="/login" replace /> } to redirect root to login
      },

      {
        path: "plasticFootprintCalculator", // Relative path, becomes /plasticFootprintCalculator
        element: <PlasticFootprintCalculator />, // Assuming this page is public
      },
      {
        path: "about-us", // <<< Add the route path
        element: <AboutUs />, // <<< Use the AboutUs component
      },
      {
        path: "contact-us", // <<< Add the route path
        element: <ContactUs />, // <<< Use the ContactUs component
      },
      // --- NEW: Route to ignore /api paths ---
      // This route will match any path starting with /api and prevent
      // react-router-dom from handling it, allowing the browser to
      // make the request directly to the backend.
      {
        path: "/api/*", // Match any path starting with /api
        element: null, // Render nothing for these paths
      },

      // --- Protected Routes ---
      {
        // This route acts as the layout container for protected dashboard pages.
        // Accessing any child of this route requires passing the ProtectedRoute check.
        path: "dashboard", // Relative path, becomes /dashboard (Changed from /userDashboard for standard naming)
        element: (
          <ProtectedRoute requiredVerification={true}>
            {" "}
            {/* Protect the dashboard layout */}
            {/*
                 UserDashboardLayout component will render an <Outlet />
                 where the matched child route element (EcoActionTracker, Leaderboard, etc.) will be displayed.
                 This requires your UserDashboard.jsx component to render <Outlet />.
              */}
            <UserDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          // These are the components that render within the <Outlet /> of UserDashboardLayout
          // They do NOT need to be wrapped by ProtectedRoute again.
          {
            // Default content when navigating to /dashboard exactly
            index: true, // Renders at the exact parent path "/dashboard"
            // You can display user details here as you intended
            element: <DashboardSummary />, // Create a component for this, e.g., DashboardSummary.jsx
          },
          {
            path: "ecoActionTracker", // Relative path, becomes /dashboard/ecoActionTracker
            element: <EcoActionTracker />,
          },
          {
            path: "leaderboard", // Relative path, becomes /dashboard/leaderboard
            element: <Leaderboard />,
          },
          {
            path: "achievementsBadges", // Relative path, becomes /dashboard/achievementsBadges
            element: <AchievementsBadges />,
          },
          {
            path: "analytics", // Relative path, becomes /dashboard/analytics
            element: <AnalyticsPage />, // <<< Use the AnalyticsPage component
          },
          {
            path: "profile", // Relative path, becomes /dashboard/profile
            element: <UserProfile />, // <<< Use the UserProfile component
          },
          // Add other dashboard sub-routes here
        ],
      },
      // Example of another protected route not part of the dashboard layout
      // {
      //    path: "profile", // Relative path, becomes /profile
      //    element: (
      //      <ProtectedRoute>
      //         <ProfilePage /> // Component for Profile page
      //      </ProtectedRoute>
      //    )
      // },
      // Example of a protected route that only requires authentication, not verification
      // {
      //    path: "settings", // Relative path, becomes /settings
      //    element: (
      //       <ProtectedRoute requiredVerification={false}> {/* Only requires authentication */}
      //          <SettingsPage /> // Component for Settings page
      //       </ProtectedRoute>
      //    )
      // }

      // --- Fallback Route ---
      {
        path: "*", // Catch-all route for any path not matched above
        element: <div>404 Not Found</div>, // Create a simple 404 Not Found component
      },
    ],
  },

  {
    // --- NEW: This is the layout route for authentication pages ---
    // These child routes will use the AuthLayout component and NOT have the Navbar/Footer
    path: "/", // You can use a common path like "/auth" if preferred, but "/" works too
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password", // Route for entering OTP and new password
        element: <ResetPassword />,
      },
      // Add other auth-related routes here if any
      // Example: { path: "reset-password/:token", element: <ResetPassword /> },
    ],
  },
]);

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {" "}
    {/* Good practice for development */}
    {/* Wrap the entire application with AuthProvider */}
    <AuthProvider>
      {/* --- NEW: Wrap the entire application with AchievementNotificationProvider --- */}
      <AchievementNotificationProvider>
        <RouterProvider router={router} /> {/* Provide the router instance */}
      </AchievementNotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);

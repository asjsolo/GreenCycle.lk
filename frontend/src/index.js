//index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client'
import "./index.css";
import App from "./App";
import RegisterLogin from "./pages/user-dashboard/register-login/RegisterLogin";
import Home from "./pages/Home";
import PlasticFootprintCalculator from "./pages/plastic-footprint-calculator/PlasticFootprintCalculator";
import UserDashboard from "./pages/user-dashboard/UserDashboard";
import EcoTracker from "./pages/user-dashboard/eco-tracker/EcoTracker";
import AchievementsBadges from "./pages/user-dashboard/achievements-badges/AchievementsBadges";
import Leaderboard from "./pages/user-dashboard/leaderboards/Leaderboard";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "registerLogin",
    element: <RegisterLogin />,
  },
  {
    path: "home",
    element: <Home />,
  },
  {
    path: "plasticFootprintCalculator",
    element: <PlasticFootprintCalculator />,
  },
  {
    path: "userDashboard",
    element: <UserDashboard />,
    children: [
      { path: "ecoTracker", element: <EcoTracker /> },
      { path: "leaderboard", element: <Leaderboard /> },
      {
        path: "achievementsBadges",
        element: <AchievementsBadges />,
      },
    ],
  },
]);

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<RouterProvider router={router} />);

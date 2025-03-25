import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client'
import "./index.css";
import App from "./App";
import RegisterLogin from "./pages/user-dashboard/register-login/RegisterLogin";
import Home from "./pages/Home";
import PlasticFootprintCalculator from "./pages/plastic-footprint-calculator/PlasticFootprintCalculator";

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
]);

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<RouterProvider router={router} />);

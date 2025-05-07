// frontend/Components/Layout/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
// Import the AuthForms.css here so it's available for all auth pages
import "../Auth/AuthForms.css";

function AuthLayout() {
  return (
    // This div will provide the background and centering from AuthForms.css
    // The actual form content will be rendered by the Outlet
    <div className="auth-container">
      <Outlet />{" "}
      {/* This is where the matched auth route component (Login, Register, etc.) will render */}
    </div>
  );
}

export default AuthLayout;

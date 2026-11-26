import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext"; // Correct import path

const ProtectedRoute = ({ children, requiredVerification = true }) => {
  // Added optional prop for verification
  const { isLoggedIn, isVerified, authLoading } = useContext(AuthContext); // Get states from context

  // Show nothing or a loader while checking auth status
  if (authLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />; // Use replace to avoid adding login to history
  }

  // If logged in but verification is required for this route and user is not verified
  if (requiredVerification && !isVerified) {
    // Redirect to the verification page
    return <Navigate to="/verify-email" replace />; // Redirect to verification page
  }

  // If logged in, verified (or verification not required), render the children
  return children;
};

export default ProtectedRoute;

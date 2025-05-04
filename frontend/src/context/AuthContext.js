//original
import { createContext, useState, useEffect } from "react";
// REMOVED: import { useNavigate } from "react-router-dom"; // Remove useNavigate import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to track authentication status, loading state, and user information
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState(null); // User data { _id, name, email, isAccountVerified, ... }
  const [authLoading, setAuthLoading] = useState(true); // Loading state for initial check

  // REMOVED: const navigate = useNavigate(); // Remove useNavigate initialization

  // Function to check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setAuthLoading(true); // Start loading
        console.log("AuthContext: Checking auth status via /api/user/data"); // Debug log

        const response = await fetch("http://localhost:4000/api/user/data", {
          method: "GET",
          credentials: "include",
        });

        console.log(
          "AuthContext: /api/user/data response status:",
          response.status
        ); // Log status

        if (response.ok) {
          const data = await response.json();
          console.log(
            "AuthContext: /api/user/data success response data:",
            data
          ); // Log data
          if (data.success) {
            setIsLoggedIn(true);
            setIsVerified(data.user.isAccountVerified);
            setUser(data.user);
          } else {
            console.warn(
              "AuthContext: /api/user/data returned success: false unexpectedly."
            );
            setIsLoggedIn(false);
            setIsVerified(false);
            setUser(null);
          }
        } else if (response.status === 401 || response.status === 403) {
          console.log(
            "AuthContext: /api/user/data returned 401 or 403. User is not authenticated or not verified."
          );
          setIsLoggedIn(false);
          setIsVerified(false);
          setUser(null);
        } else {
          console.error(
            "AuthContext: /api/user/data failed with status:",
            response.status,
            await response.text()
          );
          setIsLoggedIn(false);
          setIsVerified(false);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error during auth status check:", error);
        setIsLoggedIn(false);
        setIsVerified(false);
        setUser(null);
      } finally {
        setAuthLoading(false); // Set loading to false after check
        console.log("AuthContext: Auth status check finished."); // Debug log
      }
    };

    checkAuthStatus();
  }, []);

  // Function to update state after successful login (called by Login component)
  const login = (userData) => {
    // Expect user data from backend login response
    setIsLoggedIn(true);
    setIsVerified(userData.isAccountVerified); // Get verified status from login response
    setUser(userData); // Store user data
    setAuthLoading(false); // Ensure loading is false after login
    // Navigation *after* login will be handled by the Login component itself
  };

  // Function to handle logout (called by a component, like a logout button)
  // This function *does not* handle navigation directly.
  const logout = async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookie
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST", // Match your backend route
        credentials: "include", // Necessary to send the cookie to be cleared
      });
      // Always clear client-side state regardless of backend call success (safety)
      setIsLoggedIn(false);
      setIsVerified(false);
      setUser(null);
      // Navigation *after* logout will be handled by the component that called logout
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if backend logout failed, clear client-side state
      setIsLoggedIn(false);
      setIsVerified(false);
      setUser(null);
      // Navigation *after* logout will be handled by the component that called logout
    }
  };

  // Function to update verification status after successful email verification (called by VerifyEmail component)
  const setAccountVerified = () => {
    setIsVerified(true);
    // Optionally update the user object in state if it's stored and needs this flag updated
    setUser((prevUser) =>
      prevUser ? { ...prevUser, isAccountVerified: true } : null
    );
  };

  return (
    // Provide all relevant state and functions to consuming components
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isVerified,
        user,
        authLoading,
        login,
        logout,
        setAccountVerified,
      }}
    >
      {children}{" "}
      {/* Render the child components (which includes RouterProvider) */}
    </AuthContext.Provider>
  );
};

export default AuthContext;

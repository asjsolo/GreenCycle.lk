// frontend/pages/user-dashboard/user-profile/UserProfile.jsx
import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../context/AuthContext"; // Adjust path as needed
import "./UserProfile.css"; // Import the CSS file for styling

function UserProfile() {
  const { user, authLoading } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    name: "",
    // Add other editable fields here
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      console.log(
        "UserProfile: User context available, populating profile form."
      );
      setProfileData({
        name: user.name || "",
        // Populate other fields if needed
      });
      setLoading(false);
    } else if (!authLoading && !user) {
      console.log("UserProfile: User not authenticated, cannot load profile.");
      setError("Authentication required to view profile.");
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setSaveSuccess(null);
    setError(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    console.log(
      "UserProfile: Attempting to save profile changes:",
      profileData
    );

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      console.log(
        "UserProfile: Save profile response status:",
        response.status
      );
      console.log("UserProfile: Save profile response data:", data);

      if (response.ok) {
        setSaveSuccess(data.message || "Profile updated successfully!");
        // Optional: Update the user context if AuthContext has an updateUser function
        // updateUser(data.user);
      } else {
        if (response.status === 401 || response.status === 403) {
          setError(
            data.message ||
              "Authentication required to update profile. Please log in again."
          );
        } else {
          setError(data.message || "Failed to update profile.");
        }
      }
    } catch (err) {
      console.error("UserProfile: Error saving profile:", err);
      setError("An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Logic ---
  if (authLoading || loading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  if (error && !user) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading profile: {error}
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {" "}
      {/* Add the main container class */}
      <h2>Your Profile</h2> {/* Add the heading class implicitly via CSS */}
      {/* Display messages using the new message classes */}
      {error && <div className="message error">{error}</div>}
      {saveSuccess && <div className="message success">{saveSuccess}</div>}
      {/* Profile Form */}
      <form onSubmit={handleSaveProfile}>
        {/* Name Field */}
        <div className="form-group">
          {" "}
          {/* Add form-group class */}
          <label htmlFor="name">Name:</label> {/* Add label class implicitly */}
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            disabled={isSaving}
            // Remove Tailwind classes, styling is in CSS file now
            // className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Email Field (Display only) */}
        <div className="form-group">
          {" "}
          {/* Add form-group class */}
          <label htmlFor="email">Email:</label>{" "}
          {/* Add label class implicitly */}
          {/* Use the new non-editable-text class */}
          <p id="email" className="non-editable-text">
            {user?.email}
          </p>
        </div>

        {/* Add other profile fields here, wrapped in .form-group */}

        {/* Save Button */}
        <div className="form-actions">
          {" "}
          {/* Add form-actions class */}
          <button
            type="submit"
            className="save-button"
            disabled={isSaving}
            // Remove Tailwind classes
            // className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserProfile;

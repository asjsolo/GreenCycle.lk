import React, { useState, useEffect, useRef } from "react";
import AchievementNotification from "../../../Components/Common/AchievementNotification";

// import { useContext } from "react";
// import AuthContext from "../../context/AuthContext";

// --- Define the list of possible categories on the frontend ---
// This should match the categories used in your backend suggestionDefinitions and models.
const actionCategories = [
  "General", // Default category if none selected
  "Reduce",
  "Reuse",
  "Recycle",
  "Cleanup",
  "Sustainable Alternatives",
  "Awareness/Education",
  "Community/Advocacy",
  // Add any other categories you defined in your backend suggestions
];

function EcoActionTracker() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newActionText, setNewActionText] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  // Optional: Loading state for individual actions (e.g., completing/deleting/dismissing)
  const [actionLoading, setActionLoading] = useState({}); // State to track loading for specific action IDs
  // const { user } = useContext(AuthContext);
  const [awardedAchievement, setAwardedAchievement] = useState(null); // State to hold the awarded achievement data
  const hasFetchedInitialData = useRef(false);

  const [selectedCategory, setSelectedCategory] = useState(actionCategories[0]); // Default to the first category ("General")

  // --- Fetch Daily Eco Actions (Includes Persisted Suggestions) ---
  useEffect(
    () => {
      const fetchDailyEcoActions = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch("/api/dashboard/daily-actions", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status !== 401 && response.status !== 403) {
              throw new Error(
                errorData.message || "Failed to fetch daily eco actions"
              );
            }
            console.error(
              "Fetch daily eco actions failed due to auth:",
              response.status,
              errorData.message
            );
            setError("Authentication required. Please log in again.");
          } else {
            const data = await response.json();
            setActions(data);
            setError(null);
            console.log(
              "Successfully fetched daily eco actions with persisted suggestions:",
              data
            );
            // --- NEW: Mark initial fetch as done on success ---
            hasFetchedInitialData.current = true; // Set ref to true after successful fetch
          }
        } catch (err) {
          console.error("Fetch daily eco actions error:", err);
          setError("Failed to load daily eco actions. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      // --- NEW: Check ref before fetching ---
      if (!hasFetchedInitialData.current) {
        // Only fetch if initial fetch hasn't happened
        console.log("EcoActionTracker: Performing initial fetch."); // Debug log
        fetchDailyEcoActions();
      } else {
        console.log(
          "EcoActionTracker: Skipping initial fetch, data already loaded."
        ); // Debug log
        // If data is already loaded, ensure loading state is false
        setLoading(false);
      }
    },
    [
      /* Dependencies */
    ]
  ); // Keep dependency array empty

  // --- Handle Checkbox Change (Completing User Actions or Saved Suggestions) ---
  // Note: Completing a *saved suggestion* now marks the *saved suggestion document* as completed in DB.
  // This is different from the previous implementation where suggestions weren't saved.
  const handleCheckboxChange = async (
    actionId,
    currentCompletedStatus,
    isSuggested
  ) => {
    setActionLoading((prev) => ({ ...prev, [actionId]: true })); // Start loading for this action

    // Optimistically update the UI first
    setActions(
      actions.map((action) =>
        action._id === actionId
          ? { ...action, completed: !currentCompletedStatus }
          : action
      )
    );
    setError(null); // Clear previous errors

    // If it's a suggested action and not completed, handle it locally
    if (isSuggested && !currentCompletedStatus) {
      // Current logic: Completing a suggestion just marks it completed *locally*
      // If you want completing a suggestion to award achievements, you'd need to
      // modify the backend or call handleAddSuggestionAsUserAction here instead.
      console.log(`Marked suggestion ${actionId} as completed locally.`);
      // Optional: Show a different notification for completing a suggestion.
      setNotificationMessage("Suggestion completed!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setActionLoading((prev) => {
        delete prev[actionId];
        return { ...prev };
      });
      return; // Stop here for suggestions
    } else {
      // It's a regular user action OR a suggested action being marked incomplete again
      console.log(
        `Updating action ${actionId} completion status to ${!currentCompletedStatus}.`
      ); // Debug log

      try {
        // Call backend endpoint to update completion status
        // This works for both user actions and saved suggestions
        const response = await fetch(`/api/dashboard/eco-actions/${actionId}`, {
          method: "PUT", // Use PUT for updates
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Send the cookie
          body: JSON.stringify({ completed: !currentCompletedStatus }), // Toggle the status
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If update failed, revert the UI state
          setActions(
            actions.map(
              (action) =>
                action._id === actionId
                  ? { ...action, completed: currentCompletedStatus }
                  : action // Revert
            )
          );
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(errorData.message || "Failed to update eco action");
          }
          console.error(
            "Update eco action failed due to auth:",
            response.status,
            errorData.message
          );
          setError(
            "Authentication required to update action. Please log in again."
          );
        } else {
          // Success (status 200 OK)
          const data = await response.json(); // Backend returns { updatedAction, awardedAchievement? }
          console.log(
            "Successfully updated action and checked achievements:",
            data
          ); // Debug log

          // --- Check if an achievement was awarded ---
          if (data.awardedAchievement) {
            console.log(
              "Achievement awarded in backend response:",
              data.awardedAchievement.name
            ); // Debug log
            setAwardedAchievement(data.awardedAchievement); // Set state to display notification
          } else {
            // Show a generic success notification if no achievement was awarded
            setNotificationMessage("Great job! You're making a difference!");
            setShowNotification(true);
            setTimeout(() => {
              setShowNotification(false);
              setNotificationMessage("");
            }, 3000);
          }

          // Update the action in the local state with potential changes from backend (like awarded achievement if you choose to include it)
          setActions(
            actions.map((action) =>
              action._id === actionId ? data.updatedAction : action
            )
          ); // Update local state with backend data

          // --- Achievement Notification Integration ---
          // Backend needs to return awarded achievement data here.
          // E.g., if (updatedAction.awardedAchievement) { showAchievementNotification(updatedAction.awardedAchievement.name); }
        }
        // The optimistic update is already done. If backend returned a different state,
        // you might update the state here:
        // setActions(actions.map(action => action._id === actionId ? updatedAction : action));

        // If a suggestion was completed, should it remain on the list? Yes, marked as completed.
        // If it was a user action, it remains marked as completed.
      } catch (err) {
        console.error("Error updating eco action:", err);
        setError("Failed to update action. Please try again.");
        // Optimistic update is reverted in the catch block above this
      } finally {
        setActionLoading((prev) => {
          delete prev[actionId];
          return { ...prev };
        }); // Stop loading
      }
    }
  };
  // --- Function to close Achievement Notification ---
  const handleCloseAchievementNotification = () => {
    setAwardedAchievement(null); // Clear the state to hide the notification
    console.log("Achievement notification closed."); // Debug log
  };

  // --- Handle Adding a New Action (From Input Field) ---
  // This now ONLY handles adding from the input field.
  const handleAddAction = async () => {
    const text = newActionText.trim();

    // Basic frontend validation
    if (!text) {
      setError("Action text cannot be empty.");
      return;
    }

    setError(null);
    setAddLoading(true); // Start loading for add button

    // --- Use the selected category, or default to "General" if "General" is selected ---
    // The backend already handles defaulting if category is not provided,
    // but sending "General" explicitly is also fine if that's the default option.
    const categoryToSend =
      selectedCategory === "General" ? "General" : selectedCategory;

    console.log(
      `Attempting to add user action from input: "${text}" with category "${categoryToSend}".`
    );

    try {
      const response = await fetch("/api/dashboard/eco-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // --- Include selected category in the request body ---
        body: JSON.stringify({ text, category: categoryToSend }), // Send text AND selected category
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status !== 401 && response.status !== 403) {
          throw new Error(errorData.message || "Failed to add eco action");
        }
        console.error(
          "Add eco action failed due to auth:",
          response.status,
          errorData.message
        );
        setError("Authentication required to add action. Please log in again.");
      } else {
        const savedAction = await response.json(); // Backend returns the saved action
        console.log("Successfully added user action:", savedAction); // Debug log

        // Add the new user action to the list
        // The savedAction object from the backend should now include the category
        setActions((prevActions) => [...prevActions, savedAction]); // Use functional update
        setNewActionText(""); // Clear the input field

        // --- NEW: Reset selected category to default after adding ---
        setSelectedCategory(actionCategories[0]); // Reset to "General"

        // Optional: Show a notification for adding success
        setNotificationMessage("Action added!");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (err) {
      console.error("Error adding eco action:", err);
      setError("Failed to add new action. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  // --- Handle Adding a Suggestion as a User Action ---
  const handleAddSuggestionAsUserAction = async (suggestionAction) => {
    // Accepts the suggestion action object
    setError(null);
    setActionLoading((prev) => ({ ...prev, [suggestionAction._id]: true })); // Start loading for the suggestion item

    console.log(
      `Attempting to add suggestion "${suggestionAction.text}" as user action.`
    ); // Debug log

    try {
      // Make a POST call to create a *new* user action based on the suggestion text
      const addResponse = await fetch("/api/dashboard/eco-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: suggestionAction.text }), // Send the suggestion text
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        if (addResponse.status !== 401 && addResponse.status !== 403) {
          throw new Error(
            errorData.message ||
              `Failed to add suggestion "${suggestionAction.text}" as action`
          );
        }
        console.error(
          "Add suggestion as user action failed due to auth:",
          addResponse.status,
          errorData.message
        );
        setError("Authentication required to add action. Please log in again.");
        // Stop here if adding the user action failed
        setActionLoading((prev) => {
          delete prev[suggestionAction._id];
          return { ...prev };
        }); // Stop loading
        return;
      }

      const newUserAction = await addResponse.json(); // Backend returns the newly created user action
      console.log(
        "Successfully added suggestion as user action:",
        newUserAction
      ); // Debug log

      // --- NEW: Call backend to dismiss the original suggestion ---
      // We call the DELETE endpoint, and the backend's deleteEcoAction controller
      // knows to mark suggestions as dismissed instead of deleting.
      console.log(
        `Attempting to dismiss original suggestion ${suggestionAction._id} after adding.`
      ); // Debug log
      const dismissResponse = await fetch(
        `/api/dashboard/eco-actions/${suggestionAction._id}`,
        {
          method: "DELETE", // Use DELETE method
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!dismissResponse.ok) {
        // If dismissing fails, log an error but don't prevent adding the user action
        console.error(
          `Failed to dismiss original suggestion ${suggestionAction._id} after adding. It might reappear.`
        );
        // The user action was still added successfully, so continue with UI update
      } else {
        console.log(
          `Successfully dismissed original suggestion ${suggestionAction._id} after adding.`
        ); // Debug log
        // Backend confirmed dismissal, no need to do additional local state update for dismissal here
        // The filter below will remove it anyway.
      }

      // Update local state: Remove the original suggestion and add the new user action
      setActions((prevActions) => [
        ...prevActions.filter((action) => action._id !== suggestionAction._id), // Remove the original suggestion by its ID
        newUserAction, // Add the new user action returned by the backend
      ]);

      setNotificationMessage(
        `Added "${suggestionAction.text}" to your actions!`
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      // This catch now primarily handles errors from the initial addResponse fetch
      console.error(
        "Error adding suggestion as user action or dismissing original:",
        err
      );
      setError(
        `Failed to add suggestion "${suggestionAction.text}" as action. Please try again.`
      );
    } finally {
      setActionLoading((prev) => {
        delete prev[suggestionAction._id];
        return { ...prev };
      }); // Stop loading
    }
  };

  // --- Handle Deleting/Dismissing an Action ---
  const handleDeleteAction = async (actionId, isSuggested) => {
    // Added isSuggested parameter
    setError(null);
    // Optional: Add a confirmation dialog here

    setActionLoading((prev) => ({ ...prev, [actionId]: true })); // Start loading for this action

    try {
      // Call the backend endpoint to delete user action or dismiss suggestion
      const response = await fetch(`/api/dashboard/eco-actions/${actionId}`, {
        method: "DELETE", // Backend handles whether to delete or dismiss based on 'suggested' flag
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status !== 401 && response.status !== 403) {
          throw new Error(
            errorData.message ||
              `Failed to ${
                isSuggested ? "dismiss suggestion" : "delete eco action"
              }`
          );
        }
        console.error(
          `${
            isSuggested ? "Dismiss suggestion" : "Delete action"
          } failed due to auth:`,
          response.status,
          errorData.message
        );
        setError(
          `Authentication required to ${
            isSuggested ? "dismiss suggestion" : "delete action"
          }. Please log in again.`
        );
      } else {
        // Success (status 200 OK)
        const data = await response.json(); // Backend returns { actionId, deleted: true } or { actionId, dismissed: true }
        console.log(
          `${isSuggested ? "Suggestion dismissed" : "User action deleted"}:`,
          data
        ); // Debug log

        // Remove the action/suggestion from the local state
        setActions((prevActions) =>
          prevActions.filter((action) => action._id !== actionId)
        );

        // Show appropriate notification
        setNotificationMessage(
          data.message ||
            (isSuggested ? "Suggestion dismissed." : "Action deleted.")
        );
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          setNotificationMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error(
        `Error ${
          isSuggested ? "dismissing suggestion" : "deleting eco action"
        }:`,
        err
      );
      setError(
        `Failed to ${
          isSuggested ? "dismiss suggestion" : "delete action"
        }. Please try again.`
      );
    } finally {
      setActionLoading((prev) => {
        delete prev[actionId];
        return { ...prev };
      }); // Stop loading
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="p-6 text-center">Loading today's eco actions...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading eco actions: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Today's Eco Actions</h2>

      {/* Display error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Action List */}
      {actions.length === 0 ? (
        <p className="text-gray-500">
          No actions for today yet. Add one below!
        </p>
      ) : (
        <ul>
          {actions.map((action) => (
            // Add a class to distinguish suggestions and maybe completed items
            <li
              key={action._id}
              className={`flex items-center justify-between py-2 border-b last:border-b-0
                 ${action.suggested ? "bg-yellow-50 border-yellow-200" : ""}
                 ${
                   !action.suggested && action.completed
                     ? "bg-green-50 border-green-200"
                     : ""
                 } {/* Optional: Highlight completed user actions */}
              `}
            >
              <div className="flex items-center">
                {/* Checkbox: Only show for user actions */}
                {!action.suggested && (
                  <input
                    type="checkbox"
                    className="mr-2 form-checkbox h-5 w-5 text-green-500"
                    checked={action.completed}
                    onChange={() =>
                      handleCheckboxChange(
                        action._id,
                        action.completed,
                        action.suggested
                      )
                    }
                    disabled={actionLoading[action._id]} // Disable checkbox while loading
                  />
                )}

                <span
                  className={`${
                    action.completed ? "line-through text-gray-500" : ""
                  } ${action.suggested ? "italic text-gray-700" : ""}`}
                >
                  {action.text}
                  {/* Optional: Label suggestions */}
                  {action.suggested && (
                    <span className="ml-2 text-xs font-semibold text-yellow-700">
                      {" "}
                      (Suggestion)
                    </span>
                  )}
                  {/* Optional: Show creation date for older incomplete items */}
                  {!action.completed &&
                    !action.suggested &&
                    action.createdAt &&
                    new Date(action.createdAt).setUTCHours(0, 0, 0, 0) <
                      new Date(new Date().setUTCHours(0, 0, 0, 0)) && (
                      <span className="ml-2 text-xs text-gray-400">
                        {" "}
                        (from {new Date(action.createdAt).toLocaleDateString()})
                      </span>
                    )}
                </span>
              </div>

              {/* Action Buttons (Delete or Add/Dismiss for suggestions) */}
              <div className="flex items-center">
                {action.suggested ? (
                  // Buttons for Suggestions
                  <>
                    <button
                      onClick={() => handleAddSuggestionAsUserAction(action)} // Pass the whole suggestion action object
                      className="text-blue-500 hover:text-blue-700 ml-4 text-sm"
                      disabled={actionLoading[action._id] || addLoading} // Disable if this action is loading or general add is loading
                    >
                      {actionLoading[action._id] ? "Adding..." : "Add Action"}
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAction(action._id, action.suggested)
                      } // Pass action ID and isSuggested
                      className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      disabled={actionLoading[action._id]} // Disable if this action is loading
                    >
                      {actionLoading[action._id] ? "Dismissing..." : "Dismiss"}
                    </button>
                  </>
                ) : (
                  // Buttons for User Actions (Delete)
                  <button
                    onClick={() =>
                      handleDeleteAction(action._id, action.suggested)
                    } // Pass action ID and isSuggested (will be false)
                    className="text-red-500 hover:text-red-700 ml-4 text-sm"
                    aria-label={`Delete action: ${action.text}`}
                    disabled={actionLoading[action._id]} // Disable if this action is loading
                  >
                    {actionLoading[action._id] ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add New Action Input Form with Category Dropdown */}
      <div className="mt-4 flex items-center gap-2">
        {" "}
        {/* Added gap-2 */}
        {/* Input field */}
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow" // Added flex-grow
          placeholder="Add a new eco action"
          value={newActionText}
          onChange={(e) => setNewActionText(e.target.value)}
          disabled={addLoading}
          onKeyPress={(e) => {
            if (e.key === "Enter" && newActionText.trim() && !addLoading) {
              handleAddAction();
            }
          }}
        />
        {/* Category Dropdown */}
        <select
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={addLoading}
        >
          {/* Map through the actionCategories array to create options */}
          {actionCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {/* Add Button */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleAddAction()}
          disabled={!newActionText.trim() || addLoading}
        >
          {addLoading ? "Adding..." : "Add"}
        </button>
      </div>

      {showNotification && (
        <div className="absolute bottom-4 right-4 w-64 p-3 bg-green-200 text-green-700 rounded-md shadow-lg transition-opacity duration-500 opacity-100 z-50">
          {" "}
          {notificationMessage}
        </div>
      )}

      <AchievementNotification
        achievement={awardedAchievement}
        onClose={handleCloseAchievementNotification}
      />
    </div>
  );
}

export default EcoActionTracker;

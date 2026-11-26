// frontend/pages/user-dashboard/eco-tracker/EcoActionTracker.jsx
import React, { useState, useEffect, useRef, useCallback } from "react"; // <<< Import useRef and useCallback
//import AchievementNotification from "../../../Components/Common/AchievementNotification"; // Assuming this is commented out as per previous steps
import { useAchievementNotification } from "../../../context/AchievementNotificationContext";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate

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
  const { showAchievementNotification } = useAchievementNotification();
  //const [awardedAchievement, setAwardedAchievement] = useState(null); // Assuming this is removed as per previous steps
  const hasFetchedInitialData = useRef(false);
  // --- NEW: Ref to track if suggested action from state has been processed ---
  const hasProcessedSuggestedAction = useRef(false);

  const [selectedCategory, setSelectedCategory] = useState(actionCategories[0]);

  const location = useLocation();
  const navigate = useNavigate();

  // --- Memoize handleAddAction if it's a dependency of useEffect ---
  // This prevents handleAddAction from changing on every render if its internal
  // dependencies (like state setters or other unchanging functions) don't change.
  // It helps stabilize the useEffect dependency array.
  const handleAddAction = useCallback(
    async (actionText, actionCategory) => {
      const text = actionText || newActionText.trim(); // Use provided actionText if available, otherwise use input state
      // Decide on a category. For tips, you might want a specific category like "Sustainable Alternatives"
      // For now, we'll default to the selectedCategory from the input, but you could hardcode for tips or pass it in state.
      const category = actionCategory || selectedCategory; // Use provided category if available, otherwise use selected state

      // Basic frontend validation
      if (!text) {
        setError("Action text cannot be empty.");
        return;
      }

      setError(null);
      setAddLoading(true); // Start loading for add button (or just general add operation)

      // Use the selected category, or default to "General" if "General" is selected
      const categoryToSend = category === "General" ? "General" : category;

      console.log(
        `Attempting to add user action: "${text}" with category "${categoryToSend}".`
      );

      try {
        const response = await fetch("/api/dashboard/eco-actions", {
          method: "POST", // Use POST for creating a new resource
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Send the cookie
          // --- Include selected category in the request body ---
          body: JSON.stringify({ text, category: categoryToSend }), // Send text AND selected category
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If update failed, revert the UI state
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(errorData.message || "Failed to add eco action");
          }
          console.error(
            "Add eco action failed due to auth:",
            response.status,
            errorData.message
          );
          setError(
            "Authentication required to add action. Please log in again."
          );
        } else {
          const savedAction = await response.json(); // Backend returns the saved action
          console.log("Successfully added user action:", savedAction); // Debug log

          // Add the new user action to the list
          // The savedAction object from the backend should now include the category
          setActions((prevActions) => [...prevActions, savedAction]); // Use functional update

          // Clear input field and reset category ONLY IF the action was added from the input field
          if (!actionText) {
            // Check if actionText was NOT provided (meaning it came from the input)
            setNewActionText(""); // Clear the input field
            setSelectedCategory(actionCategories[0]); // Reset to "General"
          }

          // Optional: Show a notification for adding success
          setNotificationMessage("Action added!");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (err) {
        console.error("Error adding eco action:", err);
        setError("Failed to add new action. Please try again.");
      } finally {
        setAddLoading(false); // Stop loading
      }
    },
    [newActionText, selectedCategory, showAchievementNotification]
  ); // Dependencies for useCallback

  // --- useEffect to fetch daily eco actions ---
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
        console.log("EcoActionTracker: Performing initial fetch in useEffect."); // Debug log
        fetchDailyEcoActions();
      } else {
        console.log(
          "EcoActionTracker: Skipping initial fetch in useEffect, data already loaded."
        ); // Debug log
        // If data is already loaded, ensure loading state is false
        setLoading(false);
      }
    },
    [
      /* Dependencies */
    ]
  ); // Keep dependency array empty

  // --- useEffect to handle suggested action from navigation state ---
  useEffect(() => {
    // Check if there's a suggested action text in the navigation state
    // --- NEW: Also check if the suggested action has NOT already been processed ---
    if (
      location.state?.suggestedActionText &&
      !hasProcessedSuggestedAction.current
    ) {
      console.log(
        "EcoActionTracker: Found suggested action text in state:",
        location.state.suggestedActionText
      );
      const suggestedText = location.state.suggestedActionText;
      // You could pass category from the tip in the navigate state as well if needed.
      // For now, let's assume these tips are related to "Sustainable Alternatives" or "Reduce"
      const suggestedCategory = "Sustainable Alternatives"; // Or "Reduce", or pass from navigate state

      // --- NEW: Set the ref to true BEFORE adding the action ---
      // This prevents subsequent renders (caused by state updates like setAddLoading, setActions)
      // from re-triggering this block of code for the same navigation state.
      hasProcessedSuggestedAction.current = true;
      console.log("EcoActionTracker: Marked suggested action as processed.");

      // Call the refactored handleAddAction with the suggested text and category
      console.log("EcoActionTracker: Calling handleAddAction.");
      handleAddAction(suggestedText, suggestedCategory); // This triggers state updates and re-renders

      // Clear the state in history AFTER handleAddAction has potentially triggered re-renders
      // Use setTimeout with 0ms delay to ensure this navigate happens after any
      // synchronous state updates from handleAddAction are processed.
      console.log(
        "EcoActionTracker: Setting timeout to clear navigation state."
      );
      const clearStateTimer = setTimeout(() => {
        console.log(
          "EcoActionTracker: Timeout fired - clearing navigation state."
        );
        navigate(location.pathname, { replace: true, state: {} });
        console.log("EcoActionTracker: Navigation state cleared.");
      }, 0); // Use a delay of 0 ms - pushes the navigate to the end of the current event loop

      // --- Cleanup the timeout ---
      // If the component unmounts or the effect re-runs before the timeout fires,
      // clear the timeout to avoid calling navigate on an unmounted component.
      return () => {
        console.log("EcoActionTracker: Cleaning up clearStateTimer.");
        clearTimeout(clearStateTimer);
      };
    } else {
      // Optional: Add logs here to see when the condition is NOT met
      console.log("Suggested action useEffect: Condition not met.");
      if (location.state?.suggestedActionText) {
        console.log(
          "  Reason: suggestedActionText is present, but hasProcessedSuggestedAction.current is true."
        );
      } else {
        console.log(
          "  Reason: suggestedActionText is not present in location.state."
        );
      }
    }

    // Dependencies for this useEffect:
    // location.state: We need to react when the navigation state changes
    // handleAddAction: This function is called inside the effect (made stable with useCallback)
    // navigate: This function is used inside the effect (stable function from hook)
    // location.pathname: Used inside the navigate call (stable value)
    // hasProcessedSuggestedAction.current is NOT a dependency because we don't want
    // the effect to re-run *just* because we updated the ref. We check its value internally.
  }, [location.state, handleAddAction, navigate, location.pathname]);

  // --- Handle Checkbox Change ---
  const handleCheckboxChange = async (
    actionId,
    currentCompletedStatus,
    isSuggested
  ) => {
    // ... (rest of handleCheckboxChange logic) ...
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
    // Note: You previously had logic here to stop for suggestions.
    // If completing suggestions should *not* trigger backend achievement checks,
    // keep this return. If completing suggestions *should* trigger checks,
    // remove this and let it proceed to the backend call.
    if (isSuggested && !currentCompletedStatus) {
      console.log(
        `handleCheckboxChange: Marked suggestion ${actionId} as completed locally.`
      );
      setNotificationMessage("Suggestion completed!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setActionLoading((prev) => {
        delete prev[actionId];
        return { ...prev };
      });
      return; // Stop here for suggestions if they shouldn't trigger backend
    } else {
      // It's a regular user action OR a suggested action being marked incomplete again
      console.log(
        `handleCheckboxChange: Updating action ${actionId} completion status to ${!currentCompletedStatus}.`
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
            "handleCheckboxChange: Update eco action failed due to auth:",
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
            "handleCheckboxChange: Successfully updated action and checked achievements:",
            data
          ); // Debug log

          // --- Check for awarded achievements array and use context ---
          if (data.awardedAchievements && data.awardedAchievements.length > 0) {
            console.log(
              "handleCheckboxChange: Achievements awarded in backend response:",
              data.awardedAchievements.map((ach) => ach.name).join(", ")
            );
            showAchievementNotification(data.awardedAchievements); // Use context
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
        console.error("handleCheckboxChange: Error updating eco action:", err);
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

  // --- Handle Adding a New Action (From Input Field) ---
  const handleAddActionFromInput = () => {
    console.log("handleAddActionFromInput called."); // Log when input handler is called
    handleAddAction(); // Calls handleAddAction using the state variables
  };

  // --- Handle Adding a Suggestion as a User Action ---
  const handleAddSuggestionAsUserAction = async (suggestionAction) => {
    console.log(
      "handleAddSuggestionAsUserAction called for:",
      suggestionAction.text
    ); // Log when this handler is called
    setError(null);
    setActionLoading((prev) => ({ ...prev, [suggestionAction._id]: true }));

    console.log(
      `handleAddSuggestionAsUserAction: Attempting to add suggestion "${suggestionAction.text}" as user action.`
    );

    try {
      // Make a POST call to create a *new* user action based on the suggestion text
      const addResponse = await fetch("/api/dashboard/eco-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: suggestionAction.text,
          category: suggestionAction.category,
        }), // Send the suggestion text and category
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
          "handleAddSuggestionAsUserAction: Add suggestion as user action failed due to auth:",
          addResponse.status,
          errorData.message
        );
        setError("Authentication required to add action. Please log in again.");
        setActionLoading((prev) => {
          delete prev[suggestionAction._id];
          return { ...prev };
        });
        return;
      }

      const newUserAction = await addResponse.json(); // Backend returns the newly created user action
      console.log(
        "handleAddSuggestionAsUserAction: Successfully added suggestion as user action:",
        newUserAction
      );

      // --- Call backend to dismiss the original suggestion ---
      console.log(
        `handleAddSuggestionAsUserAction: Attempting to dismiss original suggestion ${suggestionAction._id} after adding.`
      );
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
          `handleAddSuggestionAsUserAction: Failed to dismiss original suggestion ${suggestionAction._id} after adding. It might reappear.`
        );
        // The user action was still added successfully, so continue with UI update
      } else {
        console.log(
          `handleAddSuggestionAsUserAction: Successfully dismissed original suggestion ${suggestionAction._id} after adding.`
        );
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
        "handleAddSuggestionAsUserAction: Error adding suggestion as user action or dismissing original:",
        err
      );
      setError(
        `Failed to add suggestion "${suggestionAction.text}" as action. Please try again.`
      );
    } finally {
      setActionLoading((prev) => {
        delete prev[suggestionAction._id];
        return { ...prev };
      });
    }
  };

  // --- Handle Deleting/Dismissing an Action ---
  const handleDeleteAction = async (actionId, isSuggested) => {
    console.log(
      `handleDeleteAction called for ID: ${actionId}, suggested: ${isSuggested}`
    ); // Log when handler is called
    setError(null);
    // Optional: Add a confirmation dialog here

    setActionLoading((prev) => ({ ...prev, [actionId]: true }));

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
          `handleDeleteAction: ${
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
          `handleDeleteAction: ${
            isSuggested ? "Suggestion dismissed" : "User action deleted"
          }:`,
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
        `handleDeleteAction: Error ${
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
      });
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

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {actions.length === 0 ? (
        <p className="text-gray-500">
          No actions for today yet. Add one below!
        </p>
      ) : (
        <ul>
          {actions.map((action) => (
            <li
              key={action._id}
              className={`flex items-center justify-between py-2 border-b last:border-b-0
                 ${action.suggested ? "bg-yellow-50 border-yellow-200" : ""}
                 ${
                   !action.suggested && action.completed
                     ? "bg-green-50 border-green-200"
                     : ""
                 }
              `}
            >
              <div className="flex items-center">
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
                    disabled={actionLoading[action._id]}
                  />
                )}

                <span
                  className={`${
                    action.completed ? "line-through text-gray-500" : ""
                  } ${action.suggested ? "italic text-gray-700" : ""}`}
                >
                  {action.text}
                  {action.suggested && (
                    <span className="ml-2 text-xs font-semibold text-yellow-700">
                      {" "}
                      (Suggestion)
                    </span>
                  )}
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

              <div className="flex items-center">
                {action.suggested ? (
                  <>
                    <button
                      onClick={() => handleAddSuggestionAsUserAction(action)}
                      className="text-blue-500 hover:text-blue-700 ml-4 text-sm"
                      disabled={actionLoading[action._id] || addLoading}
                    >
                      {actionLoading[action._id] ? "Adding..." : "Add Action"}
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAction(action._id, action.suggested)
                      }
                      className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      disabled={actionLoading[action._id]}
                    >
                      {actionLoading[action._id] ? "Dismissing..." : "Dismiss"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      handleDeleteAction(action._id, action.suggested)
                    }
                    className="text-red-500 hover:text-red-700 ml-4 text-sm"
                    aria-label={`Delete action: ${action.text}`}
                    disabled={actionLoading[action._id]}
                  >
                    {actionLoading[action._id] ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
          placeholder="Add a new eco action"
          value={newActionText}
          onChange={(e) => setNewActionText(e.target.value)}
          disabled={addLoading}
          onKeyPress={(e) => {
            if (e.key === "Enter" && newActionText.trim() && !addLoading) {
              handleAddActionFromInput();
            }
          }}
        />
        <select
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={addLoading}
        >
          {actionCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddActionFromInput}
          disabled={!newActionText.trim() || addLoading}
        >
          {addLoading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Keep the generic notification if you still need it */}
      {showNotification && (
        <div className="absolute bottom-4 right-4 w-64 p-3 bg-yellow-200 text-black-700 rounded-md shadow-lg transition-opacity duration-500 opacity-100 z-50">
          {" "}
          {notificationMessage}
        </div>
      )}

      {/* <AchievementNotification... */}
    </div>
  );
}

export default EcoActionTracker;

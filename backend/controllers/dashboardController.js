// backend/controllers/dashboardController.js
import mongoose from "mongoose";
import EcoAction from "../models/ecoActionModel.js";
import Achievement from "../models/achievementModel.js";
import User from "../models/userModel.js";
import { achievementDefinitions } from "../utils/achievements.js";
import { suggestionDefinitions } from "../utils/suggestions.js";

// Helper function to check and award achievements (Good idea to separate this logic)
const checkAndAwardAchievements = async (userId) => {
  // This function would contain the logic currently in updateEcoAction's 'if (completed)' block
  // We'll refine this when we integrate achievements properly.
  console.log(`Checking achievements for user ${userId}...`);
  // Placeholder for actual achievement logic
  // ... fetch completed actions count ...
  // ... fetch user's existing achievements ...
  // ... loop through definitions and check criteria ...
  // ... save new achievements ...
};

// Helper function to calculate the start of the week (Monday UTC)
const getStartOfWeekUTC = (date) => {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const diff = day === 0 ? 6 : day - 1; // Difference to Monday (handle Sunday as last day of prev week)
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper function to calculate the start of today in UTC
const getStartOfTodayUTC = () => {
  const now = new Date();
  // Get the local date string in YYYY-MM-DD format
  const localDateString = now.toISOString().split("T")[0];
  // Create a new Date object from the local date string, which will be interpreted as UTC midnight
  const todayUTC = new Date(localDateString);
  return todayUTC;
};

// Helper function to calculate the start of tomorrow in UTC
const getStartOfTomorrowUTC = () => {
  const todayUTC = getStartOfTodayUTC();
  const tomorrowUTC = new Date(todayUTC);
  tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);
  return tomorrowUTC;
};

// Get all eco actions for the authenticated user
export const getEcoActions = async (req, res) => {
  try {
    const userId = req.user.id; // User ID is attached by userAuth middleware
    const ecoActions = await EcoAction.find({ userId }).sort({ createdAt: 1 }); // Sort by creation date ascending
    res.status(200).json(ecoActions);
  } catch (error) {
    console.error("Error getting eco actions:", error); // Log error
    res.status(500).json({
      message: "An internal server error occurred while fetching actions.",
    });
  }
};

// Add a new eco action for the authenticated user
export const addEcoAction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, category } = req.body;

    // Basic input validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Action text cannot be empty." });
    }

    // NEW: Basic category validation (if required)
    if (!category) {
      // Decide how to handle missing category for user-added actions
      // Option 1: Return error if category is expected from frontend
      // return res.status(400).json({ message: "Action category is required." });
      // Option 2: Assign a default category if not provided (for user input)
      console.warn(
        `addEcoAction: Category not provided for user action "${text}". Assigning default.`
      );
      // Use a default category if none is provided
      const defaultCategory = "General"; // Define your default category
      const newAction = new EcoAction({
        userId,
        text,
        category: defaultCategory, // Use default category
        completed: false,
        suggested: false, // User-added actions are not suggestions
        // dateAssigned and dismissed are not needed for user-added actions
      });
      const savedAction = await newAction.save();
      console.log(
        "Successfully created user action with default category:",
        savedAction
      );
      return res.status(201).json(savedAction); // 201 Created
    }

    // If category is provided (expected for suggestions added as user actions)
    const newAction = new EcoAction({
      userId,
      text,
      category: category, // Use the provided category
      completed: false,
      suggested: false, // User-added actions are not suggestions
      // dateAssigned and dismissed are not needed for user-added actions
    });

    const savedAction = await newAction.save();
    console.log(
      "Successfully created user action with provided category:",
      savedAction
    ); // Debug log

    // Consider triggering achievement check here if adding *certain types* of actions unlocks something
    // await checkAndAwardAchievements(userId); // Example

    // Success response with status code and the saved action
    res.status(201).json(savedAction); // 201 Created
  } catch (error) {
    console.error("Error creating eco action:", error); // Log error
    res.status(500).json({
      message: "An internal server error occurred while creating action.",
    });
  }
};

// --- Updated Controller: updateEcoAction (Return Awarded Achievement) ---
export const updateEcoAction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { actionId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ message: "Completion status must be a boolean." });
    }

    // Find the action by its ID and userId to ensure ownership, and update it
    const updatedAction = await EcoAction.findOneAndUpdate(
      { _id: actionId, userId },
      { completed, updatedAt: Date.now() },
      { new: true } // Return the updated document
    ).lean(); // Use .lean() here too for consistency if not saving again

    if (!updatedAction) {
      console.log("Eco action not found or not authorized:", actionId, userId);
      return res
        .status(404)
        .json({ message: "Eco action not found or not authorized." });
    }

    // --- Achievement Logic (Modify to capture awarded achievement) ---
    let newlyAwardedAchievement = null; // Variable to store the awarded achievement

    if (updatedAction.completed === true && completed === true) {
      // Ensure it was just marked completed (check if previous state was false,
      // but the findOneAndUpdate doesn't give us the previous state easily with {new: true}.
      // A more robust check might involve fetching the document first without updating,
      // or using a pre-update hook. For now, we assume this block is hit only on completion).

      // Re-implement the achievement check logic here.
      // This logic should be the same as you have it, but we'll capture the result.

      const completedActionsCount = await EcoAction.countDocuments({
        userId,
        completed: true,
        suggested: false,
      }); // Count user-added completed actions
      const existingAchievements = await Achievement.find({ userId }).distinct(
        "name"
      ); // Get names of achievements already earned

      for (const achievementDef of achievementDefinitions) {
        // Check if the user has NOT already earned this achievement
        if (!existingAchievements.includes(achievementDef.name)) {
          const { criteria } = achievementDef;
          let criteriaMet = false;

          // --- Check Criteria ---
          if (
            criteria.type === "actionCount" &&
            completedActionsCount >= criteria.threshold
          ) {
            criteriaMet = true;
          }
          // Add checks for other criteria types (like actionText) here
          if (criteria.type === "actionText" && criteria.keywords) {
            // Check if the completed action's text (or any recent completed action) contains the keywords
            const actionTextLower = updatedAction.text.toLowerCase();
            const hasKeyword = criteria.keywords.some((keyword) =>
              actionTextLower.includes(keyword.toLowerCase())
            );
            // To be more comprehensive, you might check recent completed actions too
            // const recentCompletedActions = await EcoAction.find({ userId, completed: true, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean(); // e.g., last 7 days
            // const anyRecentHasKeyword = recentCompletedActions.some(action => criteria.keywords.some(keyword => action.text.toLowerCase().includes(keyword.toLowerCase())));
            if (hasKeyword) {
              // For simplicity, check only the currently completed action's text
              criteriaMet = true;
            }
          }
          // Add checks for other criteria types (e.g., streak, total XP, etc.)

          // --- If Criteria Met and Not Already Earned, Award Achievement ---
          if (criteriaMet) {
            const newAchievement = new Achievement({
              userId,
              name: achievementDef.name,
              description: achievementDef.description,
              criteria: achievementDef.criteria,
              badgeImageUrl: achievementDef.badgeImageUrl, // Include image URL
              tier: achievementDef.tier, // Include tier
              bonusType: achievementDef.bonusType, // Include bonus type
              earnedDate: new Date(), // Set earned date
            });
            await newAchievement.save();
            console.log(
              `Achievement awarded to user ${userId}: ${achievementDef.name}`
            );

            // --- Capture the awarded achievement ---
            newlyAwardedAchievement = newAchievement.toObject(); // Convert Mongoose document to plain object
            // Break loop if you only award one achievement per action completion,
            // or continue if multiple achievements can be earned by one action.
            // break; // Uncomment if you only award one per action
          }
        }
      }
    }
    // If the action was marked incomplete (completed === false) after being true,
    // you might have logic here to potentially remove achievements (less common).
    // else if (updatedAction.completed === false && completed === false) { ... }

    console.log("Successfully updated action:", updatedAction);

    // --- Include newly awarded achievement in the response ---
    const responseBody = { updatedAction };
    if (newlyAwardedAchievement) {
      responseBody.awardedAchievement = newlyAwardedAchievement;
      console.log(
        "Response includes awarded achievement:",
        newlyAwardedAchievement.name
      ); // Debug log
    }

    res.status(200).json(responseBody); // Include awardedAchievement in the response
  } catch (error) {
    console.error(
      "Error updating eco action and checking achievements:",
      error
    );
    res.status(500).json({
      message: "An internal server error occurred while updating action.",
    });
  }
};

// --- Updated Controller: DELETE Eco Action (Handles Suggestions) ---
export const deleteEcoAction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { actionId } = req.params;

    // Optional: Validate actionId format
    // if (!mongoose.Types.ObjectId.isValid(actionId)) { ... }

    // --- Step 1: Find the action and check if it's a suggestion ---
    const actionToDelete = await EcoAction.findOne({ _id: actionId, userId }); // Find the action by ID and userId

    if (!actionToDelete) {
      console.log(
        "Action not found or not authorized for deletion/dismissal:",
        actionId,
        userId
      );
      return res
        .status(404)
        .json({ message: "Action not found or not authorized." }); // 404 Not Found
    }

    // --- Step 2: Handle Suggestions vs. User Actions ---
    if (actionToDelete.suggested) {
      // If it's a suggested action, mark it as dismissed instead of deleting
      console.log(
        `Dismissing suggested action ${actionId} for user ${userId}.`
      ); // Debug log
      actionToDelete.dismissed = true; // Mark as dismissed
      actionToDelete.updatedAt = new Date(); // Update timestamp
      await actionToDelete.save(); // Save the change

      // Respond with success, maybe indicate it was a dismissal
      res.status(200).json({
        success: true,
        message: "Suggestion dismissed successfully.",
        actionId: actionToDelete._id, // Return ID
        dismissed: true, // Indicate it was a dismissal
      });
    } else {
      // If it's a regular user-added action, proceed with deletion
      console.log(`Deleting user action ${actionId} for user ${userId}.`); // Debug log
      const deletedAction = await EcoAction.findOneAndDelete({
        _id: actionId,
        userId,
      }); // Use findOneAndDelete

      // findOneAndDelete returns the deleted doc, findOne then save returns the updated doc
      // We already checked if it exists, so deletedAction will be the found doc if not a suggestion

      console.log("Successfully deleted user action:", actionToDelete._id); // Use actionToDelete since findOneAndDelete removes it
      res.status(200).json({
        success: true,
        message: "Eco action deleted successfully.",
        actionId: actionToDelete._id, // Return ID
        deleted: true, // Indicate it was a deletion
      });
    }
  } catch (error) {
    console.error("Error deleting/dismissing eco action:", error); // Log error
    res.status(500).json({
      message:
        "An internal server error occurred while deleting/dismissing action.",
    });
  }
};

// --- Modified Controller: getDailyEcoActions (Ensure Category Included) ---
export const getDailyEcoActions = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from middleware

    // Calculate the start of today and tomorrow in UTC
    const todayUTC = getStartOfTodayUTC();
    const tomorrowUTC = getStartOfTomorrowUTC();

    console.log(
      `getDailyEcoActions: Fetching actions for user ${userId} for date ${
        todayUTC.toISOString().split("T")[0]
      }`
    ); // Debug log

    // --- Step 1: Check if suggestions have ALREADY BEEN ASSIGNED for today ---
    const anySuggestionAssignedToday = await EcoAction.findOne({
      userId,
      suggested: true,
      dateAssigned: todayUTC,
    }).lean();

    let suggestionsForTodayList = [];

    // --- Step 2: If NO suggestions have been assigned for today, generate and save new ones ---
    if (!anySuggestionAssignedToday) {
      console.log(
        `getDailyEcoActions: No suggestions assigned for user ${userId} for today. Generating new ones.`
      );

      // Fetch user's actions already on the daily list to avoid suggesting duplicates
      const allUserActionsInDailyList = await EcoAction.find({
        userId,
        suggested: false,
        $or: [
          { createdAt: { $gte: todayUTC, $lt: tomorrowUTC } },
          { completed: false, createdAt: { $lt: todayUTC } },
        ],
      }).lean();
      const allUserActionsInDailyListText = allUserActionsInDailyList.map(
        (action) => action.text.toLowerCase()
      );

      // Filter suggestion definitions: Avoid suggesting actions already on the user's daily list
      const potentialSuggestions = suggestionDefinitions.filter(
        // suggestionDefinitions is array of { text, category }
        (suggestion) => {
          const suggestionTextLower = suggestion.text.toLowerCase(); // Access text property
          return !allUserActionsInDailyListText.includes(suggestionTextLower);
        }
      );

      // Shuffle potential suggestions and pick exactly 3
      const numSuggestions = 3;
      const shuffledSuggestions = potentialSuggestions.sort(
        () => 0.5 - Math.random()
      );
      const selectedSuggestions = shuffledSuggestions.slice(0, numSuggestions); // These are { text, category } objects

      // Format selected suggestions as action objects for saving
      const suggestionsToSave = selectedSuggestions.map((suggestion) => ({
        // Map over objects
        userId: userId,
        text: suggestion.text, // Use text from object
        category: suggestion.category, // <<< NEW: Include category from object
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        suggested: true,
        dateAssigned: todayUTC,
        dismissed: false,
      }));

      if (suggestionsToSave.length > 0) {
        suggestionsForTodayList = await EcoAction.insertMany(suggestionsToSave);
        console.log(
          `getDailyEcoActions: Saved ${suggestionsForTodayList.length} new suggestions for user ${userId} for today.`
        );
      } else {
        suggestionsForTodayList = [];
        console.log(
          `getDailyEcoActions: No potential suggestions available to generate for user ${userId} for today.`
        );
      }
    } else {
      // --- Step 3: If suggestions HAVE been assigned for today, fetch the non-dismissed ones ---
      console.log(
        `getDailyEcoActions: Suggestions already assigned for user ${userId} for today. Fetching existing non-dismissed.`
      );
      suggestionsForTodayList = await EcoAction.find({
        userId,
        suggested: true,
        dateAssigned: todayUTC,
        dismissed: false,
      }).lean(); // .lean() includes all fields by default
      console.log(
        `getDailyEcoActions: Found ${suggestionsForTodayList.length} active suggestions for user ${userId} for today.`
      );
    }

    // --- Step 4: Fetch user's actions for today's list (excluding suggestions) ---
    const todaysUserActions = await EcoAction.find({
      userId,
      suggested: false, // Exclude suggested actions
      $or: [
        { createdAt: { $gte: todayUTC, $lt: tomorrowUTC } },
        { completed: false, createdAt: { $lt: todayUTC } },
      ],
    }).lean(); // .lean() includes all fields by default
    console.log(
      `getDailyEcoActions: Found ${todaysUserActions.length} user actions for user ${userId} for today's list.`
    );

    // --- Step 5: Combine active suggestions and user actions ---
    let dailyActions = [...suggestionsForTodayList, ...todaysUserActions];

    // --- Step 6: Sort the combined list ---
    dailyActions.sort((a, b) => {
      // Primary sort: Suggested actions first
      if (a.suggested && !b.suggested) return -1;
      if (!a.suggested && b.suggested) return 1;

      // Secondary sort (within user actions): Incomplete first
      if (!a.suggested && !b.suggested) {
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;
      }

      // Tertiary sort (within same type/completion status): by creation date
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    console.log(
      `getDailyEcoActions: Returning ${dailyActions.length} items for daily list.`
    );

    // Success response
    res.status(200).json(dailyActions); // 200 OK
  } catch (error) {
    console.error(
      "Error getting daily eco actions with persisted suggestions:",
      error
    );
    res.status(500).json({
      message:
        "An internal server error occurred while fetching daily actions.",
    });
  }
};

// --- Updated Controller: Get User Achievements (Includes Progress) ---
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from middleware

    // Fetch user's earned achievements
    const earnedAchievements = await Achievement.find({ userId }).lean(); // Use .lean()
    console.log(
      `getUserAchievements: Found ${earnedAchievements.length} earned achievements for user ${userId}.`
    ); // Debug log

    // --- Data needed for Progress Calculation ---
    // For 'actionCount' achievements, we need the total number of completed actions
    const completedActionsCount = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false, // Count only user-added actions
    });
    console.log(
      `getUserAchievements: User ${userId} has completed ${completedActionsCount} user actions.`
    ); // Debug log

    // --- Combine Definitions with User Status and Progress ---
    const combinedAchievements = achievementDefinitions.map((definition) => {
      const earned = earnedAchievements.find(
        (userAch) => userAch.name === definition.name
      );
      const isEarned = !!earned;

      const achievementData = {
        ...definition, // Include all definition properties
        isEarned: isEarned,
        earnedDate: isEarned ? earned.earnedDate : null,
      };

      // Calculate and include progress for unearned achievements with 'actionCount' criteria
      if (!isEarned && definition.criteria.type === "actionCount") {
        achievementData.currentProgress = completedActionsCount; // User's current count of completed actions
        achievementData.totalNeeded = definition.criteria.threshold; // Threshold from definition
      } else if (isEarned && definition.criteria.type === "actionCount") {
        // If earned and actionCount, progress is 100%, can set current to threshold for display
        achievementData.currentProgress = definition.criteria.threshold;
        achievementData.totalNeeded = definition.criteria.threshold;
      }
      // For 'actionText' criteria, progress calculation is not simple like a count,
      // so we won't add currentProgress/totalNeeded for those initially.
      // Frontend should check for totalNeeded before trying to render a progress bar.

      return achievementData;
    });

    // Optional: Sort the combined list (e.g., earned first, then by name)
    combinedAchievements.sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      return a.name.localeCompare(b.name);
    });

    // Success response
    res.status(200).json(combinedAchievements); // Return the combined list with progress data
  } catch (error) {
    console.error("Error getting user achievements with progress:", error); // Log error
    res.status(500).json({
      message: "An internal server error occurred while fetching achievements.",
    });
  }
};

// --- NEW Controller: Get All Achievement Definitions ---
export const getAchievementDefinitions = async (req, res) => {
  try {
    // Simply return the array of achievement definitions
    console.log("Returning all achievement definitions."); // Debug log
    res.status(200).json(achievementDefinitions); // 200 OK with the definitions
  } catch (error) {
    console.error("Error getting achievement definitions:", error); // Log error
    res.status(500).json({
      message:
        "An internal server error occurred while fetching achievement definitions.",
    });
  }
};

// --- Updated Controller: Get User Statistics (Includes Eco-Score Trend) ---
export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // --- Calculate Day Streak (More accurate, but still simplified) ---
    // This is a basic streak calculation based on completed actions on consecutive days.
    // Real streak tracking might need a separate daily check mechanism.
    let currentStreak = 0;
    let lastActivityDate = null;

    // Fetch all completed actions sorted by date descending
    const completedActions = await EcoAction.find({
      userId,
      completed: true,
      suggested: false,
    })
      .sort({ createdAt: -1 })
      .lean(); // Sort newest first

    if (completedActions.length > 0) {
      let currentDate = new Date();
      currentDate.setUTCHours(0, 0, 0, 0); // Start from the beginning of today UTC

      let streakPossibleToday = false; // Flag if activity today counts towards streak

      // Check if there was activity today
      const latestActionDateUTC = completedActions[0].createdAt;
      const startOfTodayUTC = new Date(currentDate);

      if (latestActionDateUTC >= startOfTodayUTC) {
        streakPossibleToday = true;
        currentStreak = 1; // Streak starts at 1 if there's activity today
        lastActivityDate = startOfTodayUTC;
        currentDate.setUTCDate(currentDate.getUTCDate() - 1); // Move to yesterday
      } else {
        // If no activity today, start checking from yesterday
        lastActivityDate = new Date(completedActions[0].createdAt);
        lastActivityDate.setUTCHours(0, 0, 0, 0); // Start of the day of the last completed action
        currentStreak = 1; // Streak starts at 1 from the last activity day
        currentDate.setUTCDate(currentDate.getUTCDate() - 1); // Move to day before yesterday
      }

      // Iterate through completed actions to find consecutive days
      for (
        let i = streakPossibleToday ? 1 : 0;
        i < completedActions.length;
        i++
      ) {
        const actionDayUTC = new Date(completedActions[i].createdAt);
        actionDayUTC.setUTCHours(0, 0, 0, 0); // Start of the day of this action

        const dayBeforeLastActivity = new Date(lastActivityDate);
        dayBeforeLastActivity.setUTCDate(lastActivityDate.getUTCDate() - 1); // Start of the day *before* the last counted activity day

        if (actionDayUTC.getTime() === dayBeforeLastActivity.getTime()) {
          // If this action is from the day immediately preceding the last counted activity day
          currentStreak++; // Extend the streak
          lastActivityDate = actionDayUTC; // Update last activity day
        } else if (actionDayUTC.getTime() < dayBeforeLastActivity.getTime()) {
          // If this action is from a day before the day immediately preceding, the streak is broken
          break; // Stop counting the streak
        }
        // If actionDayUTC is the same as lastActivityDate, it's still the same streak day, continue.
      }
    }
    console.log(
      `getUserStatistics: User ${userId} current streak is ${currentStreak}.`
    ); // Debug log

    // --- Calculate Eco-Score Trend (Percentage Change in Completed Actions) ---
    // Eco-score = Total Completed User Actions
    const today = new Date();
    const startOfThisWeek = getStartOfWeekUTC(today);
    const startOfPreviousWeek = new Date(startOfThisWeek);
    startOfPreviousWeek.setUTCDate(startOfThisWeek.getUTCDate() - 7);
    const endOfPreviousWeek = new Date(startOfThisWeek); // The end of the previous week is the start of this week

    console.log(
      `getUserStatistics: Calculating eco-score trend. Start of this week (UTC): ${startOfThisWeek}. Start of previous week (UTC): ${startOfPreviousWeek}`
    ); // Debug log

    // Count completed actions this week (from start of this week up to now)
    const completedThisWeek = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfThisWeek,
        $lt: new Date(), // Up to now
      },
    });
    console.log(
      `getUserStatistics: Completed actions this week: ${completedThisWeek}`
    ); // Debug log

    // Count completed actions last week (from start of previous week up to the end of previous week)
    const completedLastWeek = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfPreviousWeek,
        $lt: endOfPreviousWeek, // Up to the start of this week (end of last week)
      },
    });
    console.log(
      `getUserStatistics: Completed actions last week: ${completedLastWeek}`
    ); // Debug log

    // Calculate percentage change
    let percentageChange = 0;
    let trendDirection = "same"; // 'up', 'down', 'same'

    if (completedLastWeek > 0) {
      percentageChange =
        ((completedThisWeek - completedLastWeek) / completedLastWeek) * 100;
      if (percentageChange > 0) trendDirection = "up";
      else if (percentageChange < 0) trendDirection = "down";
    } else {
      // If completed last week was 0
      if (completedThisWeek > 0) {
        percentageChange = 100; // Or Infinity, but 100% increase from 0 is reasonable for display
        trendDirection = "up";
      } else {
        percentageChange = 0; // 0 from 0 is 0 change
        trendDirection = "same";
      }
    }

    const ecoScoreTrend = {
      currentWeekCount: completedThisWeek,
      lastWeekCount: completedLastWeek,
      percentageChange: parseFloat(percentageChange.toFixed(1)), // Round to 1 decimal place
      trendDirection: trendDirection,
    };

    console.log(
      "getUserStatistics: Eco-score trend calculated:",
      ecoScoreTrend
    ); // Debug log

    // --- Other Stats ---
    const totalBadgesEarned = await Achievement.countDocuments({ userId }); // Example: Count earned badges
    // Placeholder: Example XP (you'll need to calculate/track this)
    const totalXP = 1500; // Placeholder

    // Count completed actions specifically for today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const completedTodayCount = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfToday,
        $lt: new Date(),
      },
    });
    console.log(
      `getUserStatistics: Completed actions today: ${completedTodayCount}`
    ); // Debug log

    const stats = {
      name: user.name,
      email: user.email,
      dayStreak: currentStreak, // Use the calculated streak
      totalXP: totalXP, // Placeholder for now
      totalBadgesEarned: totalBadgesEarned,
      completedActionsToday: completedTodayCount, // Use the calculated count
      ecoScoreTrend: ecoScoreTrend, // Include the trend data
      // Add more stats as you implement them
    };

    console.log("getUserStatistics: Returning final stats:", stats); // Debug log

    res.status(200).json({
      success: true,
      message: "User statistics fetched successfully.",
      stats: stats,
    });
  } catch (error) {
    console.error("Error getting user statistics:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while fetching statistics.",
    });
  }
};

// --- NEW Controller: Get Weekly Completed Eco Actions ---
export const getWeeklyCompletedActions = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from middleware

    // Calculate the start of the current week (Monday UTC)
    const today = new Date();
    const startOfThisWeek = getStartOfWeekUTC(today);

    // Calculate the start of next week (to get all of this week's data)
    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setUTCDate(startOfThisWeek.getUTCDate() + 7);

    // --- Aggregate Completed Actions by Day for the Last 7 Days ---
    // We'll fetch completed actions within the last week (or slightly more to be safe with timezones)
    // and group them by the day they were completed.

    // Define the start date for fetching data (e.g., start of the previous week to capture full context)
    const startOfPreviousWeek = new Date(startOfThisWeek);
    startOfPreviousWeek.setUTCDate(startOfThisWeek.getUTCDate() - 7);

    console.log(
      `Workspaceing completed actions for user ${userId} from ${startOfPreviousWeek} to ${startOfNextWeek}`
    ); // Debug log

    const completedActions = await EcoAction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Match by user ID (need to convert userId string to ObjectId for aggregation $match)
          completed: true, // Match only completed actions
          suggested: false, // Exclude suggested actions
          createdAt: {
            // Match actions created within the last ~2 weeks (to be safe for weekly view)
            $gte: startOfPreviousWeek, // Greater than or equal to the start of the previous week
            $lt: startOfNextWeek, // Less than the start of next week
          },
        },
      },
      {
        $group: {
          _id: {
            // Group by the day the action was completed (based on createdAt date)
            $dateToString: {
              format: "%Y-%m-%d", // Format date as 'YYYY-MM-DD'
              date: "$createdAt",
              timezone: "UTC", // Use UTC timezone for consistent grouping
            },
          },
          count: { $sum: 1 }, // Count documents in each group
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
      // Optional: Add $project stage to rename _id to 'date'
      // {
      //    $project: {
      //        date: "$_id",
      //        count: 1,
      //        _id: 0 // Exclude the original _id field
      //    }
      // }
    ]);

    console.log(
      `getWeeklyCompletedActions: Aggregation result for user ${userId}:`,
      completedActions
    ); // Debug log

    // The aggregation result gives counts per day where actions were completed.
    // We need to ensure we have data points for ALL 7 days of the current week,
    // even if the count is 0. We can pad the results on the frontend or backend.
    // Padding on the frontend is often easier for charting libraries.

    // For the backend, let's just return the raw aggregation result.
    res.status(200).json(completedActions); // Return array like [{ _id: 'YYYY-MM-DD', count: N }, ...]
  } catch (error) {
    console.error("Error getting weekly completed eco actions:", error); // Log error
    res.status(500).json({
      message:
        "An internal server error occurred while fetching analytics data.",
    });
  }
};

// --- NEW Controller: Get Completed Actions by Category ---
export const getCompletedActionsByCategory = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from middleware

    // Aggregate to count completed actions by category for the user
    const categoryBreakdown = await EcoAction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Match by user ID (needs ObjectId)
          completed: true, // Only count completed actions
          suggested: false, // Only count user-added actions (or decide if you want to include completed suggestions)
          category: { $exists: true, $ne: null, $ne: "" }, // Ensure category exists and is not null/empty
        },
      },
      {
        $group: {
          _id: "$category", // Group by the category field
          count: { $sum: 1 }, // Count documents in each group
        },
      },
      {
        $sort: { count: -1 }, // Optional: Sort by count descending
      },
    ]);

    console.log(
      `getCompletedActionsByCategory: Generated category breakdown for user ${userId}. Found ${categoryBreakdown.length} categories.`
    ); // Debug log
    // console.log("Category Breakdown Data:", categoryBreakdown); // Optional: Log the data

    // Success response
    // The result will be an array like: [{ _id: 'Reduce', count: 10 }, { _id: 'Recycle', count: 5 }, ...]
    res.status(200).json(categoryBreakdown); // Return the category counts
  } catch (error) {
    console.error("Error getting completed actions by category:", error); // Log error
    res
      .status(500)
      .json({
        success: false,
        message:
          "An internal server error occurred while fetching category breakdown.",
      });
  }
};

// --- NEW Controller: Get Leaderboard ---
export const getLeaderboard = async (req, res) => {
  try {
    // We don't need req.user._id here unless we want to highlight the current user in the leaderboard

    // --- Aggregate to count completed actions per user ---
    const leaderboardData = await EcoAction.aggregate([
      {
        $match: {
          completed: true, // Only count completed actions
          suggested: false, // Only count user-added actions
        },
      },
      {
        $group: {
          _id: "$userId", // Group by user ID
          totalCompletedActions: { $sum: 1 }, // Count completed actions for each user
        },
      },
      {
        $sort: { totalCompletedActions: -1 }, // Sort by total completed actions descending (highest first)
      },
      {
        $limit: 50, // Limit the leaderboard to the top 50 users (adjust as needed)
      },
      {
        $lookup: {
          // Join with the User collection to get user details
          from: User.collection.name, // The collection name (lowercase, plural)
          localField: "_id", // Field from the input documents (from the $group stage, which is userId)
          foreignField: "_id", // Field from the documents of the "from" collection (User model _id)
          as: "userDetails", // Output array field name
        },
      },
      {
        $unwind: "$userDetails", // Deconstruct the userDetails array (since _id join gives max 1 match)
      },
      {
        $project: {
          // Reshape the output documents
          _id: 0, // Exclude the aggregation _id field
          userId: "$_id", // Include the user ID
          totalCompletedActions: 1, // Include the completed actions count
          userName: "$userDetails.name", // Include the user's name from userDetails
          // You can include other user details here, but be mindful of privacy (e.g., no email or password hash)
          // userAvatarUrl: "$userDetails.avatarUrl" // If you have an avatar field
        },
      },
    ]);

    console.log(
      `getLeaderboard: Generated leaderboard data. Found ${leaderboardData.length} entries.`
    ); // Debug log
    // console.log("Leaderboard Data:", leaderboardData); // Optional: Log the data

    // Success response
    res.status(200).json(leaderboardData); // Return the ranked list of users
  } catch (error) {
    console.error("Error getting leaderboard data:", error); // Log error
    res.status(500).json({
      message:
        "An internal server error occurred while fetching leaderboard data.",
    });
  }
};

// --- NEW Controller: Generate Weekly Report ---
export const generateWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // --- Calculate Date Range for Last Week ---
    const today = new Date();
    const startOfThisWeek = getStartOfWeekUTC(today);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setUTCDate(startOfThisWeek.getUTCDate() - 7); // Start of the week before this one

    const endOfLastWeek = new Date(startOfThisWeek); // The end of last week is the start of this week

    console.log(
      `Generating weekly report for user ${userId} for the period: ${startOfLastWeek} to ${endOfLastWeek}`
    ); // Debug log

    // --- Fetch Data for the Report ---

    // 1. Completed User Actions Last Week
    const completedActionsLastWeek = await EcoAction.find({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfLastWeek,
        $lt: endOfLastWeek,
      },
    }).lean();
    console.log(
      `Report: Found ${completedActionsLastWeek.length} completed actions last week.`
    ); // Debug log

    // Optional: Count completed actions by category last week (if you have categories)
    // const actionsByCategory = await EcoAction.aggregate([
    //     { $match: { userId: new mongoose.Types.ObjectId(userId), completed: true, suggested: false, createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek } } },
    //     { $group: { _id: "$category", count: { $sum: 1 } } } // Assuming a 'category' field exists
    // ]);

    // 2. New Achievements Earned Last Week
    const newAchievementsLastWeek = await Achievement.find({
      userId,
      earnedDate: {
        $gte: startOfLastWeek,
        $lt: endOfLastWeek,
      },
    }).lean();
    console.log(
      `Report: Found ${newAchievementsLastWeek.length} new achievements earned last week.`
    ); // Debug log

    // 3. Eco-Score Trend (This Week vs Last Week) - Reuse logic from getUserStatistics if needed, or just include counts
    // We already calculate this in getUserStatistics. You could potentially call that controller internally
    // or duplicate the logic here. Let's duplicate the count logic for self-containment of the report data.

    const completedThisWeek = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfThisWeek,
        $lt: new Date(), // Up to now
      },
    });

    const completedPreviousWeekForTrend = await EcoAction.countDocuments({
      userId,
      completed: true,
      suggested: false,
      createdAt: {
        $gte: startOfLastWeek,
        $lt: endOfLastWeek, // The period for last week's count
      },
    });

    let percentageChange = 0;
    let trendDirection = "same";

    if (completedPreviousWeekForTrend > 0) {
      percentageChange =
        ((completedThisWeek - completedPreviousWeekForTrend) /
          completedPreviousWeekForTrend) *
        100;
      if (percentageChange > 0) trendDirection = "up";
      else if (percentageChange < 0) trendDirection = "down";
    } else {
      if (completedThisWeek > 0) {
        percentageChange = 100;
        trendDirection = "up";
      } else {
        percentageChange = 0;
        trendDirection = "same";
      }
    }

    const weeklyTrend = {
      thisWeekCount: completedThisWeek,
      lastWeekCount: completedPreviousWeekForTrend,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      trendDirection: trendDirection,
    };
    console.log("Report: Weekly trend calculated:", weeklyTrend);

    // --- Structure the Report Data ---
    const reportData = {
      reportPeriod: {
        startDate: startOfLastWeek,
        endDate: endOfLastWeek, // Note: End date is exclusive in queries, so this is the start of the *next* week
      },
      summary: {
        totalCompletedActionsLastWeek: completedActionsLastWeek.length,
        // actionsByCategory: actionsByCategory // If implemented
      },
      completedActions: completedActionsLastWeek, // List of completed actions
      newAchievements: newAchievementsLastWeek, // List of new achievements earned
      ecoScoreTrend: weeklyTrend, // Weekly trend data
      // Add other data points as needed (e.g., longest streak achieved this week if you track daily)
    };

    console.log("Report data generated successfully.");

    // --- Return Report Data as JSON ---
    res.status(200).json({
      success: true,
      message: "Weekly report data generated successfully.",
      report: reportData, // Return the report data object
    });

    // --- Optional: Server-side Emailing or File Generation ---
    // If you wanted to email or generate a file, you would add that logic here
    // after structuring the reportData. For now, we're just returning the JSON.
  } catch (error) {
    console.error("Error generating weekly report:", error); // Log error
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while generating the report.",
    });
  }
};

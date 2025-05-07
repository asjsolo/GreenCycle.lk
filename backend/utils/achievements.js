// backend/utils/achievements.js

export const achievementDefinitions = [
  {
    name: "Eco-Newbie",
    description: "Completed 5 eco actions.",
    criteria: { type: "actionCount", threshold: 5 },
    badgeFilename: "eco-newbie.png", // Placeholder URL
    tier: "Bronze",
  },
  {
    name: "Green Warrior",
    description: "Completed 25 eco actions.",
    criteria: { type: "actionCount", threshold: 25 },
    badgeFilename: "green-warrior.png", // Placeholder URL
    tier: "Silver",
  },
  {
    name: "Eco-Champion",
    description: "Completed 100 eco actions.",
    criteria: { type: "actionCount", threshold: 100 },
    badgeFilename: "eco-champion.png", // Placeholder URL
    tier: "Gold",
  },
  {
    name: "Recycling Ranger",
    description: "Added an action related to recycling.",
    criteria: { type: "actionText", keywords: ["recycle", "recycling"] },
    badgeFilename: "recycling-ranger.png", // Placeholder URL
    bonusType: "Recycling",
  },
  {
    name: "First Step",
    description: "Completed your very first eco action.",
    criteria: { type: "actionCount", threshold: 1 }, // Earned after 1 completed action
    badgeFilename: "first-step.png", // New badge image needed
    tier: "Bronze", // Or a special tier like "Intro"
  },
  {
    name: "Plastic Reductionist",
    description: "Logged 5 actions related to reducing single-use plastic.",
    criteria: {
      type: "actionText",
      keywords: [
        "reusable bag",
        "reusable bottle",
        "refuse straw",
        "avoid plastic",
        "plastic-free",
      ],
    }, // Keywords for action text
    badgeFilename: "plastic-reductionist.png", // New badge image needed
    bonusType: "Reduction", // New bonus type
  },
  {
    name: "Community Builder",
    description: "Made 3 posts or comments in the Community Forum.",
    criteria: { type: "forumActivity", threshold: 3 }, // Requires tracking forum posts/comments
    badgeFilename: "community-builder.png", // New badge image needed
    bonusType: "Community", // New bonus type
  },
  // --- NEW Achievements ---
  {
    name: "Plastic Footprint Master",
    description: "Used the Plastic Footprint Calculator 5 times.",
    criteria: { type: "calculatorUsage", threshold: 5 }, // Requires tracking calculator uses
    badgeFilename: "calculator-master.png", // New badge image needed
    tier: "Silver",
  },
  {
    name: "Directory Explorer",
    description: "Found 3 recycling centers using the Directory.",
    criteria: { type: "directoryUsage", threshold: 3 }, // Requires tracking directory searches/views
    badgeFilename: "directory-explorer.png", // New badge image needed
    tier: "Bronze",
  },
  // Add more achievements here
];

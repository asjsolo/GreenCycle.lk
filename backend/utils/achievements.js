// backend/utils/achievements.js

export const achievementDefinitions = [
  {
    name: "Eco-Newbie",
    description: "Completed 5 eco actions.",
    criteria: { type: "actionCount", threshold: 5 },
    badgeImageUrl: "/images/badges/eco-newbie.png", // Placeholder URL
    tier: "Bronze",
  },
  {
    name: "Green Warrior",
    description: "Completed 25 eco actions.",
    criteria: { type: "actionCount", threshold: 25 },
    badgeImageUrl: "/images/badges/green-warrior.png", // Placeholder URL
    tier: "Silver",
  },
  {
    name: "Eco-Champion",
    description: "Completed 100 eco actions.",
    criteria: { type: "actionCount", threshold: 100 },
    badgeImageUrl: "/images/badges/eco-champion.png", // Placeholder URL
    tier: "Gold",
  },
  {
    name: "Recycling Ranger",
    description: "Added an action related to recycling.",
    criteria: { type: "actionText", keywords: ["recycle", "recycling"] },
    badgeImageUrl: "/images/badges/recycling-ranger.png", // Placeholder URL
    bonusType: "Recycling",
  },
  {
    name: "Transportation Trailblazer",
    description: "Added an action related to sustainable transportation.",
    criteria: {
      type: "actionText",
      keywords: ["walk", "bike", "public transport", "carpool"],
    },
    badgeImageUrl: "/images/badges/transportation-trailblazer.png", // Placeholder URL
    bonusType: "Transportation",
  },
  {
    name: "Energy Saver",
    description: "Added an action related to saving energy.",
    criteria: {
      type: "actionText",
      keywords: ["energy", "electricity", "power"],
    },
    badgeImageUrl: "/images/badges/energy-saver.png", // Placeholder URL
    bonusType: "Energy",
  },
  {
    name: "Water Wise",
    description: "Added an action related to conserving water.",
    criteria: { type: "actionText", keywords: ["water"] },
    badgeImageUrl: "/images/badges/water-wise.png", // Placeholder URL
    bonusType: "Water",
  },
  {
    name: "Zero-Waste Hero",
    description: "Added an action related to zero waste or composting.",
    criteria: { type: "actionText", keywords: ["zero waste", "compost"] },
    badgeImageUrl: "/images/badges/zero-waste-hero.png", // Placeholder URL
    bonusType: "Zero-Waste",
  },
  // Add more achievements here
];

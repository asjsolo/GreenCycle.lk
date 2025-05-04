import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For efficient querying by user
    },
    name: {
      type: String,
      required: true,
      // Examples: "Eco-Newbie", "Green Warrior", "First Action Completed", "Zero-Waste Hero"
    },
    badgeImageUrl: {
      type: String,
      // URL to the image for the badge
    },
    description: {
      type: String,
      // Description of the achievement
    },
    earnedDate: {
      type: Date,
      default: Date.now,
    },
    tier: {
      type: String,
      // Optional: For tiered badges (e.g., "Bronze", "Silver", "Gold")
    },
    bonusType: {
      type: String,
      // Optional: For bonus badges (e.g., "Zero-Waste")
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;

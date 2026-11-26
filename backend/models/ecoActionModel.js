// backend/models/ecoActionModel.js
import mongoose from "mongoose";

const ecoActionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to your User model
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // NEW: Fields for suggested actions
  suggested: {
    // Is this action a suggestion?
    type: Boolean,
    default: false,
  },
  dateAssigned: {
    // The start of the day (UTC) this suggestion was assigned
    type: Date,
    // Required if suggested is true, otherwise shouldn't be present
    required: function () {
      return this.suggested === true;
    },
  },
  dismissed: {
    // Has this suggestion been dismissed by the user for the day?
    type: Boolean,
    default: false,
  },
  // --- NEW: Category field ---
  category: {
    type: String,
    required: true, // Make category required for all actions (user-added or suggested)
    trim: true,
    // Optional: Add enum if you want to restrict categories to a predefined list
    // enum: ['Reduce', 'Reuse', 'Recycle', 'Cleanup', 'Sustainable Alternatives', 'Awareness/Education', 'Community/Advocacy']
  },
  // Optional: Link to the original suggestion definition ID if you have them keyed
  // suggestionDefinitionId: { type: String }
});

// Update the updateOne middleware to set updatedAt on updates
ecoActionSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Add indexes for efficient querying
ecoActionSchema.index({ userId: 1, createdAt: 1 }); // For fetching user actions
ecoActionSchema.index({
  userId: 1,
  suggested: 1,
  dateAssigned: 1,
  dismissed: 1,
}); // For fetching suggestions

const EcoAction = mongoose.model("EcoAction", ecoActionSchema);

export default EcoAction;

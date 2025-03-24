import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    questionId: {
        type: mongoose.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    vote: {
        type: Number, // 1 for upvote, -1 for downvote
        enum: [1, -1],
        required: true,
    }
}, { timestamps: true });

const Vote = mongoose.model('Vote', VoteSchema);
export default Vote;

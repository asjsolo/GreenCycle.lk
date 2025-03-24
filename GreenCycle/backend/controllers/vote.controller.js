import Vote from "../models/vote.model.js";
import Question from "../models/question.model.js";

export const voteQuestion = async (req, res) => {
    try {
        let { userId, questionId, voteType } = req.body;

        // Convert voteType to a number to avoid type errors
        voteType = Number(voteType);

        if (!userId || !questionId || (voteType !== 1 && voteType !== -1 && voteType !== 0)) {
            return res.status(400).json({ 
                message: "Missing or invalid parameters",
                error: true 
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const existingVote = await Vote.findOne({ userId, questionId });

        if (!existingVote) {
            await Vote.create({ userId, questionId, vote: voteType });

            await Question.findByIdAndUpdate(questionId, {
                $inc: voteType === 1 ? { upvotes: 1 } : { downvotes: 1 }
            });
        } else if (existingVote.vote === voteType) {
            await Vote.deleteOne({ _id: existingVote._id });

            await Question.findByIdAndUpdate(questionId, {
                $inc: voteType === 1 ? { upvotes: -1 } : { downvotes: -1 }
            });
        } else {
            await Vote.findByIdAndUpdate(existingVote._id, { vote: voteType });

            await Question.findByIdAndUpdate(questionId, {
                $inc: voteType === 1 ? { upvotes: 1, downvotes: -1 } : { upvotes: -1, downvotes: 1 }
            });
        }

        const updatedQuestion = await Question.findById(questionId);
        const totalVotes = updatedQuestion.upvotes - updatedQuestion.downvotes;

        res.status(200).json({ 
            message: "Vote updated successfully",
            upvotes: updatedQuestion.upvotes,
            downvotes: updatedQuestion.downvotes,
            totalVotes 
        });

    } catch (error) {
        console.error("Error processing vote:", error);
        res.status(500).json({ message: "Error processing vote", error });
    }
};

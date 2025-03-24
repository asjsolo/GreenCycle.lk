import mongoose from "mongoose";
import Question from "../models/question.model.js";
import { error } from "console";
import Vote from "../models/vote.model.js";

export async function createQuestion(request, response) {
    const {author, content} = request.body;

    if(!author || !content){
        return response.status(400).json({
            message : "provide all the details",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(author)){
        return response.status(400).json({
            message : "Invalid object id",
            error : true,
            success : false
        })
    }

    const newQuestion = new Question({author, content});
    const save = await newQuestion.save();

    return response.status(200).json({
        message : "New Question created successfully",
        error : false,
        success : true
    })
}

export async function viewQuestion(request, response) {
    const questionId = request.query.questionId;

    if(!questionId){
        return response.status(400).json({
            message : "provide all details",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(questionId)){
        return response.status(400).json({
            message : "Invalid object id",
            error : true,
            success : false
        })
    }

    const question = await Question.findById(questionId);

    if(!question){
        return response.status(404).json({
            message : "Question not found!",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "Question return successfully",
        error : false,
        success : true,
        data : question
    })
    
}

export async function getAllQuestion(request, response) {
    try {
        const { userId } = request.body; // Logged-in user ID

        // Fetch all questions
        const questions = await Question.find().sort({ updatedAt: -1 });

        // If userId is provided, check the vote status for each question
        const questionsWithVotes = await Promise.all(
            questions.map(async (question) => {
                const existingVote = await Vote.findOne({ userId, questionId: question._id });
                return {
                    ...question.toObject(),
                    userVote: existingVote ? existingVote.vote : 0 // 1 = upvote, -1 = downvote, 0 = no vote
                };
            })
        );

        return response.status(200).json({
            message: "Questions retrieved successfully",
            error: false,
            success: true,
            data: questionsWithVotes
        });
    } catch (error) {
        return response.status(500).json({
            message: "Error retrieving questions" + error,
            error: true,
            success: false
        });
    }
}


export async function pinnedQuestion(request, response) {
    const questionId = request.query.questionId;

    if(!questionId){
        return response.status(400).json({
            message : "provide question id",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(questionId)){
        return response.status(400).json({
            message : "Invalid question id",
            error : true,
            success : false
        })
    }

    const question = await Question.findById(questionId);

    if(!question){
        return response.status(400).json({
            message : "Question not found!",
            error : true,
            success : true
        })
    }

    const pinned = await Question.findByIdAndUpdate(questionId, {isPinned : !question.isPinned});

    if(pinned.modifiedCount === 0){
        return response.status(400).json({
            message : "Question not pinned succesfully",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "Question pinned successfully",
        error : true,
        success : false
    })
}


export async function answerQuestion(request, response) {
    const questionId = request.query.questionId;

    const {author, content} = request.body;

    if(!questionId || !author || !content){
        return response.status(400).json({
            message : "provide required details",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(author)){
        return response.status(400).json({
            message : "Invalid object id",
            error : true,
            success : false
        })
    }

    const question = await Question.findById(questionId);

    if(!question){
        return response.status(404).json({
            message : "Question not found!",
            error : true,
            success : false
        })
    }

    const addAnswer = await Question.findByIdAndUpdate(questionId, 
        {$push: {answers : {content, author}}}, {new : true});

    if(addAnswer.modifiedCount === 0){
        return response.status(400).json({
            message : "Answer not added successfully",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "Answer added successfully",
        error : false,
        success : true
    })
}

export async function updateQuestion(request, response) {
    const questionId = request.query.questionId;

    const {author, content} = request.body;

    if(!author || !content){
        return response.status(400).json({
            message : "provide all the details",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(author) || !mongoose.Types.ObjectId.isValid(questionId)){
        return response.status(400).json({
            message : "Invalid object id",
            error : true,
            success : false
        })
    }

    const updatedQuestion = await Question.findByIdAndUpdate(questionId, {author, content});

    if(updatedQuestion.modifiedCount === 0){
        return response.status(400).json({
            message : "Question not updated succefully",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "Question updated",
        error : false,
        success : true
    })


}

export async function deleteQuestion(request, response) {
    const questionId = request.query.questionId;

    if(!questionId){
        return response.status(400).json({
            message : "provide all details",
            error : true,
            success : false
        })
    }

    if(!mongoose.Types.ObjectId.isValid(questionId)){
        return response.status(400).json({
            message : "Invalid object id",
            error : true,
            success : false
        })
    }

    const question = await Question.findById(questionId);

    if(!question){
        return response.status(404).json({
            message : "Question not found!",
            error : true,
            success : false
        })
    }

    const deletePost = await Question.deleteOne({_id : questionId})

    if(deletePost.modifiedCount === 0){
        return response.status(400).json({
            message : "Question not deleted succefully",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "Question deleted successfully",
        error : false,
        success : true,
        data : question
    })
    
}
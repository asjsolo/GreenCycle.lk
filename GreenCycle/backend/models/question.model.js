import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    content : {
        type : String,
        required : true,
    },
    author : {
        type : mongoose.Types.ObjectId,
        required : true
    }

}, {timestamps : true})

const Answer = mongoose.model('Answer', AnswerSchema);

const QuestionSchema = new mongoose.Schema({
    author : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    content : {
        type : String,
        required : true
    },
    answers : {
        type : [AnswerSchema],
        default : []
    },
    upvotes : {
        type : Number,
        default : 0
    },
    downvotes : {
        type : Number,
        default : 0
    },
    isPinned : {
        type : Boolean,
        default : false
    }

}, {timestamps : true})

const Question = mongoose.model('Question', QuestionSchema);
export default Question;
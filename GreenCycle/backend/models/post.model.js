import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type : String,
        required : true
    },
    author : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required : true
    },
    CommentId : {
        type : [mongoose.Schema.Types.ObjectId],
        default : []
    },
    flaggedBy : {
        type : [mongoose.Schema.Types.ObjectId],
        default: []
    },
    favoritedBy : {
        type : [mongoose.Schema.Types.ObjectId],
        default : [],
        ref : "User"
    }
}, {
    timestamps : true
})

const postModel = mongoose.model("post", postSchema);

export default postModel;
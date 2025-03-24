import mongoose, { isValidObjectId } from "mongoose";
import postModel from "../models/post.model.js";

export async function createPost(request, response) {
    const {content, author} = request.body;

    if(!content){
        return response.status(400).json({
            message : "provide title and content",
            error : true,
            success : false
        })
    }

    if (!mongoose.isValidObjectId(author)) {
        return response.json({
            message : "Invalid object Id",
            error : true,
            success : false
        })
    }

    const payload = {
        author : new mongoose.Types.ObjectId(author),
        content
    }
    const newPost = new postModel(payload)
    const save = await newPost.save()

    return response.json({
        message : "New post created succcessfully",
        error : false,
        success : true,
        data : save
    })
}


export async function updatePost(request, response) {

    const {author, content, postId} = request.body;

    if(!content){
        return response.status(400).json({
            message : "provide title and content",
            error : true,
            success : false
        })
    }

    if(!isValidObjectId(author)){
        return response.status(400).json({
            message : "Invalid author id",
            error : true,
            success : false
        })
    }

    if(!isValidObjectId(postId)){
        return response.status(400).json({
            message : "Invalid post id",
            error : true,
            success : false
        })
    }

    const post = await postModel.findById(postId);
    if(!post){
        return response.status(404).json({
            message : "post not found",
            error : true,
            success : false
        })
    }

    if(post.author != author){
        return response.status(403).json({
            message : "unauthorize access",
            error : true,
            success : false
        })
    }

    const updatePost = await postModel.updateOne(
        {_id: postId},
        {$set: {content}}
    )

    if(updatePost.modifiedCount == 0){
        return response.status(400).json({
            message : "Failed to update post",
            error: true,
            success: false
        })
    }
    return response.json({
        message: "Post updated successfully",
        error: false,
        success: true
    })
    
}

export async function viewPost(request, response) {
    const postId = request.query.postId;

    if(!postId){
        return response.status(400).json({
            message : "provide post id",
            error : true,
            success : false
        })
    }
    if(!isValidObjectId(postId)){
        return response.status(400).json({
            message : "Invalid post id",
            error : true,
            success : false
        })
    }

    const post = await postModel.findById(postId)

    if(!post){
        return response.status(404).json({
            message : "Post not found!",
            error : true,
            success : false
        })
    }

    const data = {
        id: post._id,
        content: post.content,
        user_id: post.author,
        comment_count: Array.isArray(post.CommentId) ? post.CommentId.length : 0,
        reaction_count: Array.isArray(post.favoritedBy) ? post.favoritedBy.length : 0, 
        created_at: post.createdAt.toDateString()

    }

    return response.json({
        message : "post details find successfully",
        error : false,
        success : true,
        data : data
    })
}

export async function getAllPosts(request, response) {
    try {
        const posts = await postModel.find();

        if (!posts || posts.length === 0) {
            return response.status(404).json({
                message: "No posts found!",
                error: true,
                success: false
            });
        }

        const data = Array.isArray(posts) ? posts.map(post => ({
            id: post._id,
            content: post.content,
            user_id: post.author,
            comment_count: Array.isArray(post.CommentId) ? post.CommentId.length : 0,
            reaction_count: Array.isArray(post.favoritedBy) ? post.favoritedBy.length : 0, 
            created_at: post.createdAt.toDateString()
        })) : [];
        

        return response.json({
            message: "All post details retrieved successfully",
            error: false,
            success: true,
            data: data
        });
    } catch (error) {
        return response.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
            details: error.message
        });
    }
}




export async function deletePost(request, response) {
    const postId = request.query.postId;

    if(!postId){
        return response.status(400).json({
            message : "provide post id",
            error : true,
            success : false
        })
    }

    if(!isValidObjectId(postId)){
        return response.status(400).json({
            message : "Invalid post id",
            error : true,
            success : false
        })
    }

    const post = await postModel.findById(postId);

    if(!post){
        return response.status(404).json({
            message : "post not found!",
            error : true,
            success : false
        })
    }

    const delPost = await postModel.deleteOne({_id : postId});

    if(delPost.modifiedCount === 0){
        return response.status(400).json({
            message : "post not deleted successfully",
            error : true,
            success : false
        })
    }

    return response.status(200).json({
        message : "post deleted successfully",
        error : false,
        success : true
    })
}
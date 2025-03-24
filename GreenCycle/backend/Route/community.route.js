import { Router } from "express";
import {createPost, deletePost, getAllPosts, updatePost, viewPost} from "../controllers/post.controller.js"
import {upload, uploadFile, deleteFile} from "../controllers/file.controller.js";
import { answerQuestion, createQuestion, deleteQuestion, getAllQuestion, pinnedQuestion, updateQuestion, viewQuestion } from "../controllers/question.controller.js";
import { voteQuestion } from "../controllers/vote.controller.js";

const communityRouter = Router();

communityRouter.post('/create-post', createPost);
communityRouter.post('/update-post', updatePost);
communityRouter.get('/viewpost', viewPost);
communityRouter.get('/post', getAllPosts);
communityRouter.delete('/deletepost', deletePost);
communityRouter.post('/upload-file', upload.single('file'), uploadFile);
communityRouter.delete('/delete-file', deleteFile)

communityRouter.post('/create-question', createQuestion);
communityRouter.get('/view-question', viewQuestion);
communityRouter.get('/get-allQuestion', getAllQuestion)
communityRouter.put('/update-question', updateQuestion);
communityRouter.delete('/delete-question', deleteQuestion)
communityRouter.post('/pinned-Question', pinnedQuestion)
communityRouter.post('/add-answer', answerQuestion)
communityRouter.post('/add-vote', voteQuestion)
export default communityRouter;

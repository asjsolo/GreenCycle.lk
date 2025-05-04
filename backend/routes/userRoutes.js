import express from "express";
import {
  getUserData,
  updateUserProfile,
} from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put("/profile", userAuth, updateUserProfile); // PUT /api/user/profile
export default userRouter;

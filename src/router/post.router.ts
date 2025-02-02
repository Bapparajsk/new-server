import {Router} from "express";
import {commentPost, createUrl, get, getUser, likePost, verifyPostImage, getComments} from "../controller/post";

const postRouter = Router();
// * path: /api/post

postRouter.get("/", get);
postRouter.get("/:userId", getUser);

postRouter.get("/:postId/comments", getComments);

postRouter.post("/create-url", createUrl);
postRouter.post("/verify-post", verifyPostImage);

postRouter.post("/:postId/like", likePost);
postRouter.post("/:postId/comment", commentPost);

export default postRouter;

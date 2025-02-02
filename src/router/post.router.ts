import {Router} from "express";
import {commentPost, createUrl, get, getUser, likePost, verifyPostImage} from "../controller/post";

const postRouter = Router();
// * path: /api/posts

postRouter.get("/", get);
postRouter.get("/:userId", getUser);

postRouter.post("/create-url", createUrl);
postRouter.post("/verify-post", verifyPostImage);

postRouter.post("/:postId/like", likePost);
postRouter.post("/:postId/comment", commentPost);

export default postRouter;

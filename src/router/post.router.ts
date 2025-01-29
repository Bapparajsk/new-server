import { Router } from "express";
import { get, createUrl, likePost, commentPost, verifyPostImage } from "../controller/post";

const postRouter = Router();
// * path: /api/posts

postRouter.get("/", get);

postRouter.post("/create-url", createUrl);
postRouter.post("/verify-post", verifyPostImage);

postRouter.post("/:postId/like", likePost);
postRouter.post("/:postId/comment", commentPost);

export default postRouter;

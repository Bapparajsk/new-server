import {Router} from "express";
import {commentPost, createUrl, get, getUser, likePost, verifyPostImage, getComments} from "../controller/post";

const postRoute = Router();
// * path: /api/post

postRoute.get("/", get);
postRoute.get("/:userId", getUser);

postRoute.get("/:postId/comments", getComments);

postRoute.post("/create-url", createUrl);
postRoute.post("/verify-post", verifyPostImage);

postRoute.post("/:postId/like", likePost);
postRoute.post("/:postId/comment", commentPost);

export default postRoute;

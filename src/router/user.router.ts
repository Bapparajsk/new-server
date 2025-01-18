import { Router } from "express";
import { get, getUserById, update, imageUpload } from "../controller/user";

const userRouter = Router();

// * Path: /api/user
userRouter.get("/", get);           // Path: /api/user/
userRouter.get("/:id", getUserById);    // Path: /api/user/:id

userRouter.patch("update/:env", update);    // Path: /api/user/:env
userRouter.post("update/image", imageUpload);    // Path: /api/user/image

export default userRouter;

import { Router } from "express";
import { getUser, getUserById } from "../controller/user";

const userRouter = Router();

// * Path: /api/user
userRouter.get("/", getUser);           // Path: /api/user/
userRouter.get("/:id", getUserById);    // Path: /api/user/:id

export default userRouter;

import { Router } from "express";
import { get, getUserById } from "../controller/user";

const userRouter = Router();

// * Path: /api/user
userRouter.get("/", get);           // Path: /api/user/
userRouter.get("/:id", getUserById);    // Path: /api/user/:id

export default userRouter;

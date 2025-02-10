import { Router } from "express";
import { get, getUserById, update, imageUpload } from "../controller/user";

const userRoute = Router();

// * Path: /api/user
userRoute.get("/", get);           // Path: /api/user/
userRoute.get("/:id", getUserById);    // Path: /api/user/:id

userRoute.patch("/update/:env", update);    // Path: /api/user/:env
userRoute.patch("/update/image", imageUpload);    // Path: /api/user/image

export default userRoute;

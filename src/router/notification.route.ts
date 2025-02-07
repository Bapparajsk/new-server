import { Router } from "express";
import { getNotification } from "../controller/notification";

const notificationRoute = Router();

// * path: /api/notification
notificationRoute.get("/", getNotification);

export default notificationRoute;

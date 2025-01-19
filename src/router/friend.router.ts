import { Router } from "express";
import { getSuggestionsFriend, getFriendsList, getFriendRequests } from "../controller/friend";

const friendRouter = Router();

friendRouter.get('/friends', getFriendsList);
friendRouter.get('/friend-requests', getFriendRequests);
friendRouter.get('/suggestions', getSuggestionsFriend);

export default friendRouter;

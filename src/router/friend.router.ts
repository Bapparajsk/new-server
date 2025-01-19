import {Router} from "express";
import {
    acceptFriendRequest,
    getFriendRequests,
    getFriendsList,
    getSuggestionsFriend,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest
} from "../controller/friend";

const friendRouter = Router();

// path: /api/friend

// * get friends list
friendRouter.get('/friends', getFriendsList);
friendRouter.get('/friend-requests', getFriendRequests);
friendRouter.get('/suggestions', getSuggestionsFriend);

// * send friend request
friendRouter.post('/send-request', sendFriendRequest);
friendRouter.post('/accept-request', acceptFriendRequest);
friendRouter.post('/reject-request', rejectFriendRequest);
friendRouter.delete('/remove-friend', removeFriend);

export default friendRouter;

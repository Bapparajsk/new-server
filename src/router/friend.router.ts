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
friendRouter.post('/send-request/:friendId', sendFriendRequest);
friendRouter.post('/accept-request/:friendId', acceptFriendRequest);
friendRouter.post('/reject-request/:friendId', rejectFriendRequest);
friendRouter.delete('/remove-friend/:friendId', removeFriend);

export default friendRouter;

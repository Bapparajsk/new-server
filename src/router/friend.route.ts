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

const friendRoute = Router();

// path: /api/friend

// * get friends list
friendRoute.get('/friends', getFriendsList);
friendRoute.get('/friend-requests', getFriendRequests);
friendRoute.get('/suggestions', getSuggestionsFriend);

// * send friend request
friendRoute.patch('/send-request/:friendId', sendFriendRequest);
friendRoute.patch('/accept-request/:friendId', acceptFriendRequest);
friendRoute.patch('/reject-request/:friendId', rejectFriendRequest);
friendRoute.delete('/remove-friend/:friendId', removeFriend);

export default friendRoute;

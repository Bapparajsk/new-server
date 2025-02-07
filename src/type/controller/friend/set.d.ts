import {User} from "../../../schema/user.schema";

export interface SetNotificationType {
    user: User;
    friend: User;
    type: "friend-accept" | "friend-request" | "friend-reject";
}

export interface ConnectFriendByType {
    user: User;
    friend: User;
    env: "friends" | "friendRequests" | "friendRequestsSent";
}

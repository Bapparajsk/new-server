import axios from "axios";
import {User} from "../schema/user.schema";

export const sortUser = (user: User) => {
    return {
        userId: user._id,
        name: user.name,
        title: user.title,
        profilePicture: user.profilePicture,
        likedPosts: user.likedPosts,
        chatSystem: user.chatSystem.chatRooms,
    }
}

export const userAllData = (user: User) => {
    return {
        userId: user._id,
        name: user.name,
        title: user.title,
        profilePicture: user.profilePicture,
        friends: Array.from(user.friends.values()).slice(0, 4),
        totalFriends: user.friends.size,
        posts: user.posts.slice(0, 10),
    }
}

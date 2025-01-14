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

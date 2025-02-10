import {User} from "../schema/user.schema";

const commonUserData = (user: User) => {
    return {
        userId: user._id,
        name: user.name,
        title: user.title,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        verifyEmail : user.verifyEmail,
    }
}

export const sortUser = (user: User) => {
    return {
        ...commonUserData(user),
        likedPosts: user.likedPosts,
        chatSystem: user.chatSystem.chatRooms,
        isNewPassword: !user.password,
    }
}

export const userAllData = (user: User) => {
    return {
        ...commonUserData(user),
        friends: Array.from(user.friends.values()).slice(0, 4),
        totalFriends: user.friends.size,
        posts: user.posts.slice(0, 10),
    }
}

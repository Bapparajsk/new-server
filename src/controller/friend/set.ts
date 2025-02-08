import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import { User, Notification } from "../../schema/user.schema";
import {ConnectFriendByType, SetNotificationType} from "../../type/controller/friend/set";
import {userNotificationProducer} from "../../lib/bullmqProducer";
import {deleteKeysByPattern} from "../../lib/cach";

// Helper Functions
const connectFriendBy = ({user, friend, env} : ConnectFriendByType) => {
    user[env].set(friend._id as string, {
        userId: friend._id as string,
        name: friend.name,
        title: friend.title,
        profilePicture: friend.profilePicture,
        createdAt: new Date(),
    });
};

const createNotification = ({user, friend, type}: SetNotificationType): Notification => {
    const titles = {
        "friend-request": "Friend Request",
        "friend-accept": "Friend Accept",
        "friend-reject": "Friend Reject",
    };
    const descriptions = {
        "friend-request": `${friend.name} sent you a friend request`,
        "friend-accept": `${friend.name} accepted your friend request`,
        "friend-reject": `${friend.name} rejected your friend request`,
    };

    return {
        name: friend.name,
        title: titles[type],
        imageSrc: {
            env: "cloudinary",
            url: friend.profilePicture,
            alt: friend.name,
        },
        description: descriptions[type],
        type,
        link: `/profile/uid=${friend._id}`,
        linkName: friend.name,
        date: new Date(),
    }
};

const verify = async (user: User | undefined, friendId: string, res: Response): Promise<[User, User, string] | false> => {
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
    }

    if (!friendId) {
        res.status(400).json({ message: "Bad Request" });
        return false;
    }

    const friend = await UserModel.findById(friendId);
    if (!friend) {
        res.status(404).json({ message: "User not found" });
        return false;
    }

    return [user, friend, friendId];
};

// Controllers
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const users = await verify(req.User, req.params.friendId, res);
        if (!users) return;
        const [user, friend, friendId] = users;
        
        if (!user.friendRequests.has(friendId)) {
            res.status(400).json({ message: "Friend request not found" });
            return;
        }

        connectFriendBy({user, friend, env: "friends"});
        connectFriendBy({ user: friend, friend: user, env: "friends"});
        user.friendRequests.delete(friendId);
        friend.friendRequestsSent.delete(user._id as string);

        await Promise.all([user.save(), friend.save()]);
        res.status(201).json({ message: "Friend request accepted" });

        userNotificationProducer({
            id: friend._id as string,
            notification: createNotification({user, friend, type: "friend-accept"}),
            pushNotificationToken: friend.pushNotificationToken
        }).catch(console.error);

        deleteKeysByPattern(`friends:${friend._id}:*`).catch(console.error);
        deleteKeysByPattern(`friends:${user._id}:*`).catch(console.error);
        deleteKeysByPattern(`friendRequests:${user._id}:*`).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const users = await verify(req.User, req.params.friendId, res);
        if (!users) return;
        const [user, friend, friendId] = users;
        
        if (user._id === friend._id) {
            res.status(400).json({ message: "Cannot send friend request to self" });
            return;
        }
        
        if (user.friends.has(friendId)) {
            res.status(400).json({ message: "Already friends" });
            return;
        }

        if (user.friendRequestsSent.has(friendId)) {
            res.status(400).json({ message: "Friend request already sent" });
            return;
        }

        let type: "friend-accept" | "friend-request" = "friend-accept";

        if (user.friendRequests.has(friendId)) {
            connectFriendBy({ user, friend, env: "friends" });
            connectFriendBy({ user: friend, friend: user, env: "friends" });
            user.friendRequests.delete(friendId);
            friend.friendRequestsSent.delete(user._id as string);
        } else {
            type = "friend-request";
            connectFriendBy({ user, friend, env: "friendRequestsSent" });
            connectFriendBy({ user: friend, friend: user, env: "friendRequests" });
        }

        // * save and send response
        await Promise.all([user.save(), friend.save()]);
        res.status(201).json({ message: "Friend request sent" });

        userNotificationProducer({
            id: friend._id as string,
            notification: createNotification({user, friend, type}),
            pushNotificationToken: friend.pushNotificationToken
        }).catch(console.error);

        deleteKeysByPattern(`friendRequests:${friend._id}:*`).catch(console.error);
        deleteKeysByPattern(`suggestions:${user._id}:*`).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const users = await verify(req.User, req.params.friendId, res);
        if (!users) return;
        const [user, friend, friendId] = users;

        if (!user.friendRequests.has(friendId)) {
            res.status(400).json({ message: "Friend request not found" });
            return;
        }

        user.friendRequests.delete(friendId);
        friend.friendRequestsSent.delete(user._id as string);

        await Promise.all([user.save(), friend.save()]);
        res.status(201).json({ message: "Friend request rejected" });

        userNotificationProducer({
            id: friend._id as string,
            notification: createNotification({user, friend, type: "friend-reject"}),
            pushNotificationToken: friend.pushNotificationToken
        }).catch(console.error);
        await deleteKeysByPattern(`friendRequests:${user._id}:*`);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeFriend = async (req: Request, res: Response) => {
    try {
        const users = await verify(req.User, req.params.friendId, res);
        if (!users) return;
        const [user, friend, friendId] = users;

        if (!user.friends.has(friendId)) {
            res.status(400).json({ message: "Not friends" });
            return;
        }

        user.friends.delete(friendId);
        friend.friends.delete(user._id as string);

        await Promise.all([user.save(), friend.save()]);
        res.status(200).json({ message: "Friend removed" });
        await deleteKeysByPattern(`friends:${friend._id}:*`);
        await deleteKeysByPattern(`friends:${user._id}:*`);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

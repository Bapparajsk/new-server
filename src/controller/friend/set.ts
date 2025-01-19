import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import { User } from "../../schema/user.schema";

// Helper Functions
const connectFriendBy = (user: User, friend: User, env: "friends" | "friendRequests" | "friendRequestsSent") => {
    user[env].set(friend._id as string, {
        userId: friend._id as string,
        name: friend.name,
        title: friend.title,
        profilePicture: friend.profilePicture,
        createdAt: new Date(),
    });
};

const setNotification = (user: User, friend: User, type: "friend-accept" | "friend-request" | "friend-reject") => {
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

    user.notifications.push({
        name: friend.name,
        title: titles[type],
        imageSrc: friend.profilePicture,
        description: descriptions[type],
        link: `/profile/${friend._id}`,
        linkName: "View Profile",
        type,
        date: new Date(),
    });
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

        connectFriendBy(user, friend, "friends");
        connectFriendBy(friend, user, "friends");
        user.friendRequests.delete(friendId);
        friend.friendRequestsSent.delete(user._id as string);
        setNotification(friend, user, "friend-accept");

        // TODO - send notification to friend from socket and push notification -> firebase

        await Promise.all([user.save(), friend.save()]);

        res.status(201).json({ message: "Friend request accepted" });
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

        if (user.friendRequests.has(friendId)) {
            connectFriendBy(user, friend, "friends");
            connectFriendBy(friend, user, "friends");
            user.friendRequests.delete(friendId);
            friend.friendRequestsSent.delete(user._id as string);
            setNotification(friend, user, "friend-accept");
            // TODO - send notification to friend from socket and push notification -> firebase
        } else {
            // TODO - send notification to friend from socket and push notification -> firebase
            connectFriendBy(user, friend, "friendRequestsSent");
            connectFriendBy(friend, user, "friendRequests");
            setNotification(friend, user, "friend-request");
        }

        await Promise.all([user.save(), friend.save()]);

        res.status(201).json({ message: "Friend request sent" });
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
        setNotification(friend, user, "friend-reject");

        // TODO - send notification to friend from socket and push notification -> firebase

        await Promise.all([user.save(), friend.save()]);

        res.status(201).json({ message: "Friend request rejected" });
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

        // TODO - send notification to friend from socket and push notification -> firebase

        await Promise.all([user.save(), friend.save()]);

        res.status(200).json({ message: "Friend removed" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

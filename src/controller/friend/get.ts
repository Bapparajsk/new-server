import { Request, Response } from 'express';
import { redisConfig } from "../../config";
import { Friend } from "../../schema/user.schema";
import { getObjectURL } from "../../lib/awsS3";
import UserModel from "../../models/user.model";

const LIMIT = Number(process.env.LIMIT || "10");

const cacheResponse = async (key: string, data: any, expiry = 60) => {
    await redisConfig.set(key, JSON.stringify(data), 'EX', expiry);
};

const fetchCachedData = async (key: string) => {
    const cachedData = await redisConfig.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};

const updateProfilePictures = async (items: Friend[]) => {
    return Promise.all(
        items.map(async (item) => {
            if (item.profilePicture) {
                item.profilePicture = await getObjectURL(item.profilePicture);
            }
            return item;
        })
    );
};

const handlePagination = (items: Friend[], page: number) => {
    const skip = (page - 1) * LIMIT;
    return items.slice(skip, skip + LIMIT);
};

export const getFriendsList = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const key = `friends:${user._id}:${page}`;
        let friends = await fetchCachedData(key);
        console.log(friends + " friends");
        if (!friends) {
            console.log("friends not found");
            friends = handlePagination(Array.from(user.friends.values()), page);
            friends = await updateProfilePictures(friends);
            await cacheResponse(key, friends);
        }

        res.status(200).json({ friends });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getFriendRequests = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const key = `friendRequests:${user._id}:${page}`;
        let friendRequests = await fetchCachedData(key);

        if (!friendRequests) {
            friendRequests = handlePagination(Array.from(user.friendRequests.values()), page);
            friendRequests = await updateProfilePictures(friendRequests);
            await cacheResponse(key, friendRequests);
        }

        res.status(200).json({ friendRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getSuggestionsFriend = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const key = `suggestions:${user._id}:${page}`;
        let suggestions = await fetchCachedData(key);

        if (!suggestions) {
            const excludeIds = [
                ...Array.from(user.friends.values()).map((f) => f.userId),
                ...Array.from(user.friendRequests.values()).map((f) => f.userId),
                ...Array.from(user.friendRequestsSent.values()).map((f) => f.userId),
                user._id,
            ];

            suggestions = await UserModel.find({ _id: { $nin: excludeIds } })
                .limit(LIMIT)
                .skip((page - 1) * LIMIT)
                .select(['_id', 'name', 'title', 'profilePicture'])
                .lean();

            suggestions = await updateProfilePictures(suggestions);
            await cacheResponse(key, suggestions);
        }

        res.status(200).json({ suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

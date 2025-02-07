import { Request, Response } from 'express';
import { Friend } from "../../schema/user.schema";
import { getObjectURL, generateKeyToUrl } from "../../lib/awsS3";
import UserModel from "../../models/user.model";
import {cacheResponse, fetchCachedData, handlePagination} from "../../lib/cach";

const LIMIT = Number(process.env.PAGE_LIMIT || "10");
const TIME = 60; // 1 minute

const updateProfilePictures = async (friends: Friend[]) => {
    return await generateKeyToUrl(friends, async (data) => (
        data.map(async (item) => {
            if (item.profilePicture) {
                item.profilePicture = await getObjectURL(item.profilePicture);
            }
            return item;
        })
    ));
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

        if (!friends) {
            console.log("friends not found");
            friends = handlePagination(Array.from(user.friends.values()), page, LIMIT);
            friends = await updateProfilePictures(friends);
            await cacheResponse(key, friends, TIME);
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
            friendRequests = handlePagination(Array.from(user.friendRequests.values()), page, LIMIT);
            friendRequests = await updateProfilePictures(friendRequests);
            await cacheResponse(key, friendRequests, TIME);
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
	console.log(suggestions, "hey");
        if (!suggestions) {
            const excludeIds = [
                ...Array.from(user.friends.values()).map((f) => f.userId),
                ...Array.from(user.friendRequests.values()).map((f) => f.userId),
                ...Array.from(user.friendRequestsSent.values()).map((f) => f.userId),
                user._id,
            ];
		console.log(excludeIds);
            suggestions = await UserModel.find({ _id: { $nin: excludeIds } })
                .limit(LIMIT)
                .skip((page - 1) * LIMIT)
                .select(['_id', 'name', 'title', 'profilePicture'])
                .lean();

            suggestions = await updateProfilePictures(suggestions);
            console.log("suggestions", suggestions);
            
            await cacheResponse(key, suggestions, TIME);
        }

        res.status(200).json({ suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

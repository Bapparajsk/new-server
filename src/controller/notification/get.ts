import { Request, Response } from "express";
import {cacheResponse, fetchCachedData, handlePagination} from "../../lib/cach";
import { getObjectURL, generateKeyToUrl } from "../../lib/awsS3";
import { Notification } from "../../schema/user.schema";

const LIMIT = Number(process.env.PAGE_LIMIT || "5");
const TIME = 60; // 1 minute

const updateProfilePictures = async (friends: Notification[]) => {
    return await generateKeyToUrl(friends, async (data) => (
        data.map(async (item) => {
            if (item.profilePicture) {
                item.profilePicture = await getObjectURL(item.profilePicture);
            }
            return item;
        })
    ));
}

export const get = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const key = `notification:userId:${user._id}:${page}`;
        let notifications = await fetchCachedData(key);

        if (!notifications) {
            console.log("notifications not found");
            notifications = handlePagination(Array.from(user.notifications.values()), page, LIMIT);
            notifications = await updateProfilePictures(notifications);
            await cacheResponse(key, notifications, TIME);
        }
        
        const nextPage = notifications.length === LIMIT ? page + 1 : null;

        res.status(200).json({ notifications, nextPage });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

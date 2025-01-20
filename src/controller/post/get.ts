import { Request, Response } from "express";
import { cacheResponse, fetchCachedData } from "../../lib/cach";
import PostModel from "../../models/post.model";
import {generateKeyToUrl, getObjectURL} from "../../lib/awsS3";

const LIMIT = Number(process.env.PAGE_LIMIT || "10");
const TIME = 3 * 60 * 60; // 3 hours

export const get = async (req: Request, res: Response) => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const key = `posts:${page}`;
        let posts = await fetchCachedData(key);
        if (!posts) {
            posts = await PostModel.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * LIMIT)
                .limit(LIMIT)
                .populate("author", "name title, profilePicture")
                .lean()
                .select(["userId", "description", "postImage", "likes", "createdAt"]);

            posts = await generateKeyToUrl(posts, async (items) => (
                items.map(async (item) => {
                    if (item.postImage) {
                        item.postImage = await getObjectURL(item.postImage, TIME);
                    }

                    if (item.author.profilePicture) {
                        item.author.profilePicture = await getObjectURL(item.author.profilePicture, TIME);
                    }

                    return item;
                })
            ));
            await cacheResponse(key, posts, TIME);
        }

        res.status(200).json({ posts });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

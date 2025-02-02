import { Request, Response } from "express";
import { cacheResponse, fetchCachedData } from "../../lib/cach";
import PostModel from "../../models/post.model";
import { generateKeyToUrl, getObjectURL } from "../../lib/awsS3";

const LIMIT = Number(process.env.PAGE_LIMIT || "5");
const TIME = 60; // 1 minute

const fetchPosts = async (filter: object, page: number, key: string) => {
    let posts = await fetchCachedData(key);
    if (!posts) {
        posts = await PostModel.find(filter)
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
    return posts;
};

export const get = async (req: Request, res: Response) => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const key = `posts:${page}`;
        const posts = await fetchPosts({}, page, key);
        const nextPage = posts.length === LIMIT ? page + 1 : null;
        res.status(200).json({ posts, nextPage });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const key = `posts:${userId}:${page}`;
        const posts = await fetchPosts({ author: userId }, page, key);
        const nextPage = posts.length === LIMIT ? page + 1 : null;
        res.status(200).json({ posts, nextPage });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

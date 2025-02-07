import { Request, Response} from "express";
import { generateToken, verifyToken } from "../../lib/jwt";
import { putObjectURL, verifyImageUpload } from "../../lib/awsS3";
import { Notification } from "../../schema/user.schema";
import PostModel from "../../models/post.model";
import UserModel from "../../models/user.model";

export const createUrl = async (req: Request, res: Response) => {
    const { fileName } = req.body;
    if (!fileName) {
        res.status(400).json({ message: "Invalid Request" });
        return;
    }

    const user = req.User;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const key = `post/${user._id}/${Date.now()}-${fileName}`;
        const putUrl = await putObjectURL(key, "image/jpeg");
        const accessToken = generateToken({ key }, "5m");

        user.accessToken = accessToken;
        user.accessTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        res.status(200).json({ putUrl, accessToken });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const verifyPostImage = async (req: Request, res: Response) => {
    const {accessToken, description} = req.body;
    if (!accessToken) {
        res.status(400).json({ message: "Invalid Request" });
        return;
    }
    const user = req.User;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        if (typeof accessToken !== "string") {
            res.status(400).json({message: "Invalid access token provided"});
            return;
        }

        if (user.accessTokenExpires && user.accessTokenExpires < new Date()) {
            res.status(400).json({ message: "Access Token Expired" });
            return;
        }

        if (user.accessToken !== accessToken) {
            res.status(400).json({ message: "Invalid Access Token" });
            return;
        }

        const { key } = verifyToken(accessToken) as { key: string };
        const isUploaded = await verifyImageUpload(key);

        if (!isUploaded) {
            res.status(400).json({ message: "Invalid Image Uploaded" });
            return;
        }

        const newPost = new PostModel({ author: user._id as string, postImage: key, description });

        user.posts.push(key);
        user.notifications.push({ name: "post", description, type: "post", date: new Date() });

        user.accessToken = null;
        user.accessTokenExpires = null;

        await Promise.all([newPost.save(), user.save()]);
        res.status(200).json({ message: "Post Created Successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const likePost = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    if (!postId) {
        res.status(400).json({ message: "Invalid Request" });
        return;
    }

    const user = req.User;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            res.status(400).json({ message: "Invalid Post" });
            return;
        }

        if (user.likedPosts.has(postId)) {
            user.likedPosts.delete(postId);
            post.likes -= 1;
        } else {
            user.likedPosts.set(postId, post._id as string);
            post.likes += 1;
        }

        const notification: Notification = {
            name: user.likedPosts.has(postId) ? "like" : "unlike",
            description:  "Your post has been " + user.likedPosts.has(postId) ? "like" : "unlike",
            linkName: user.name,
            link: '/profile/uid=' + user._id,
            type:  user.likedPosts.has(postId) ? "like" : "unlike",
            date: new Date()
        }

        await Promise.all([
            user.save(),
            post.save(),
            UserModel.findOneAndUpdate({ _id: post.author }, { $push: { notifications: notification } })
        ]);
        res.status(200).json({ message: "Post Liked Successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const commentPost = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const { comment } = req.body;
    if (!postId || !comment) {
        res.status(400).json({ message: "Invalid Request" });
        return;
    }

    const user = req.User;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            res.status(400).json({ message: "Invalid Post" });
            return;
        }

        post.comments.push({ userId: user._id as string,comment, createdAt: new Date() });
        user.notifications.push({ name: "comment", description: comment, date: new Date() });

        await Promise.all([user.save(), post.save()]);
        res.status(200).json({ message: "Post Commented Successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

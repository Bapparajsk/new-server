import {Request, Response} from "express";
import {User} from "../../schema/user.schema";
import {updateName} from "./update.name";
import {updatePassword} from "./update.password";
import {pictureUpdate} from "./picture.update";
import { verifyToken } from "../../lib/jwt";
import {verifyImageUpload} from "../../lib/awsS3";

const updateConfig = async (env: string, user: User , body: any) => {
    try {
        switch (env) {
            case "name":
                return updateName(user, body);
            case "password":
                return updatePassword(user, body);
            case "profilePicture":
            case "coverPicture":
                return pictureUpdate(user, body, env);
        }

        return [true, "Invalid environment"];
    } catch (e) {
        console.error(e);
        return [true, "Internal server error"];
    }
}

const update = async (req: Request, res: Response) => {
    try {
        const env = req.params.env;
        const body = req.body;

        if (!["name", "password", "profilePicture", "coverPicture"].includes(env)) {
            res.status(404).json({message: "Invalid environment"});
            return;
        }

        const user = req.User;
        if (!user) {
             res.status(401).json({message: "Unauthorized"});
             return;
        }

        const [error, message] = await updateConfig(env, user, body);
        if (error) {
            res.status(400).json({message});
            return;
        }

        await user.save();
        res.status(200).json(message);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
}

const imageUpload = async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        res.status(400).json({message: "Invalid access token provided"});
        return;
    }

    try {
        const { key, env } = verifyToken(accessToken) as { key: string, env: string };
        const user = req.User;
        if (!user) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        if (!key || !env) {
            res.status(400).json({message: "Invalid access token provided"});
            return;
        }

        const isUploaded = await verifyImageUpload(key);
        if (!isUploaded) {
            res.status(400).json({message: "Invalid image uploaded"});
            return;
        }

        if (env === "profilePicture") {
            user.profilePicture = key;
        } else {
            user.coverPicture = key;
        }
        user.notifications.push({ name: env, description: "Your profile picture has been updated", date: new Date() });

        await user.save();
        res.status(200).json({message: "Profile picture updated successfully"});
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal server error" });
    }
}

export {
    update,
    imageUpload
};

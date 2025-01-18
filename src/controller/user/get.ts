import { Request, Response } from "express";
import {redisConfig} from "../../config";
import {sortUser, userAllData} from "../../lib/user";
import UserModel from "../../models/user.model";
import {User} from "../../schema/user.schema";

export const get = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user: sortUser(user) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        let user: User | string | null = await redisConfig.get(`userId:${id}`);
        if (typeof user === "string") {
            res.status(200).json({ user: JSON.parse(user) });
        }

        user = await UserModel.findById(id) as User;
        if (!user) {
            res.status(400).json({ message: "Bad Request" });
        }

        const userData = userAllData(user);
        redisConfig.set(`userId:${id}`, JSON.stringify(userData), "EX", 60 * 60 * 24);

        res.status(200).json({ user: userData });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

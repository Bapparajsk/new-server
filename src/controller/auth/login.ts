import { Request, Response } from 'express';
import z from 'zod';
import {loginZod} from "../../lib/zod";
import UserModel from "../../models/user.model";
import {sortUser} from "../../lib/user";

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginZod.parse(req.body);
        const user = await UserModel.findOne({ email });

        // check if user exists
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // create token
        const token = user.generateToken();
        res.status(200).json({ token, user: sortUser(user) });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.errors[0].message });
            return;
        }
        res.status(400).json({ message: "interval server error" });
    }
}

export default login;

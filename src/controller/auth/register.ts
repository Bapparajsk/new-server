import { Request, Response } from "express";
import z from "zod";
import { registerZod } from "../../lib/zod";
import UserModel from "../../models/user.model";
import sendOtpEmail from "../../lib/email";
import {sortUser} from "../../lib/user";

const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = registerZod.parse(req.body);
        let user = await UserModel.findOne({ email });
        if (user) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        user = new UserModel({ name, email, password });
        const otp = user.generateOTP();
        const token = user.generateToken();
        await user.save();
        res.status(201).json({ message: "User created", token: token, user: sortUser(user) });

        // send otp email
        sendOtpEmail(email, otp).catch(console.error);
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.errors[0].message });
            return;
        }
        res.status(400).json({ message: "interval server error" });
    }
}

export default register;

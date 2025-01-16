import { Request, Response } from 'express';
import z from 'zod';
import {loginZod} from "../../lib/zod";
import UserModel from "../../models/user.model";
import {sortUser} from "../../lib/user";
import { generateToken } from "../../lib/jwt";
import sendOtpEmail from "../../lib/email";

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

        if (user.towFactorAuth === true) {
            // create temporary token and send OTP
            const tempToken = generateToken({ email: user.email }, '5m');
            const otp = user.generateOTP();
            await user.save();

            // Send OTP email asynchronously
            sendOtpEmail(email, otp).catch(console.error);

            // Respond with success
            res.status(200).json({ message: "Two Factor Authentication is enabled", tempToken });
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

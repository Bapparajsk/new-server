import { Request, Response } from 'express';
import z from 'zod';
import {loginZod} from "../../lib/zod";
import UserModel from "../../models/user.model";
import {sortUser} from "../../lib/user";
import { generateToken } from "../../lib/jwt";
import sendOtpEmail from "../../lib/email";
import {v4 as uuidv4} from "uuid";
import {LoginDevice, Notification} from "../../schema/user.schema";
import {setCookie} from "../../lib/setCookie";

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginZod.parse(req.body);
        const user = await UserModel.findOne({ email });
        
        // check if user exists
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // check if user has password set
        if (user.password === null) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // check if user has 2FA enabled
        if (user.towFactorAuth === true) {
            // create temporary token and send OTP
            const tempToken = generateToken({ email: user.email }, '5m');
            const otp = user.generateOTP();
            user.accessToken = tempToken;
            user.accessTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            await user.save();

            // Send OTP email asynchronously
            sendOtpEmail(email, otp).catch(console.error);

            // Respond with success
            res.status(200).json({ message: "Two Factor Authentication is enabled", tempToken });
            return;
        }

        // prepare login device details
        const deviceId = uuidv4();
        const deviceDetails: LoginDevice = {
            deviceId,
            deviceName: req.useragent?.source || "Unknown",
            os: req.useragent?.os || "Unknown",
            lastLogin: new Date(),
            isPrimary: false,
        };
        user.loginDevices.set(deviceId, deviceDetails);

        const notification : Notification = {
            name: "Login",
            title: "New Login",
            description: "New login from " + deviceDetails.deviceName,
            imageSrc: {
                env: "local",
                url: "/notification/login.png",
                alt: user.name,
            },
            type: "login",
            date: new Date(),
        }

        // add notification to user
        user.notifications.push(notification);
        // save user
        await user.save();

        // create token and set client cookie
        const token = user.generateToken({deviceId}, '2d');
        setCookie(res, token);

        res.status(200).json({ user: sortUser(user) });
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

import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { registerZod } from "../../lib/zod";
import UserModel from "../../models/user.model";
import sendOtpEmail from "../../lib/email";
import { sortUser } from "../../lib/user";
import { LoginDevice, Notification } from "../../schema/user.schema";
import {setCookie} from "../../lib/setCookie";

const register = async (req: Request, res: Response) => {
    try {
        // Validate input
        const { name, email, password } = registerZod.parse(req.body);

        // Check if the email already exists
        if (await UserModel.exists({ email })) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        // Prepare login device details
        const deviceId = uuidv4();
        const deviceDetails: LoginDevice = {
            deviceId,
            deviceName: req.useragent?.source || "Unknown",
            os: req.useragent?.os || "Unknown",
            lastLogin: new Date(),
            isPrimary: false,
        };

        // Create a new Map for loginDevices
        const loginDevices = new Map<string, LoginDevice>();
        loginDevices.set(deviceId, deviceDetails);

        // Prepare notification
        const notification: Notification = {
            name: "App",
            title: "Welcome to the app",
            description: "You have successfully registered",
            imageSrc: {
                env: "local",
                url: "/notification/register.png",
                alt: "App logo",
            },
            type: "register",
            date: new Date(),
        };

        // Create and save user
        const user = new UserModel({
            name,
            email,
            password,
            loginDevices,
        });
        const otp = user.generateOTP();
        const token = user.generateToken({deviceId}, "2d");
        user.notifications.push(notification);
        await user.save();

        // Send OTP email asynchronously
        sendOtpEmail(email, otp).catch(console.error);
        setCookie(res, token);

        // Respond with success
        res.status(201).json({
            message: "User created",
            user: sortUser(user),
        });
    } catch (error) {
        console.error(error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.errors[0]?.message || "Validation error" });
            return;
        }

        // Handle generic errors
        res.status(500).json({ message: "Internal server error" });
    }
};

export default register;

import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { registerZod } from "../../lib/zod";
import UserModel from "../../models/user.model";
import sendOtpEmail from "../../lib/email";
import { sortUser } from "../../lib/user";
import { LoginDevice } from "../../schema/user.schema";

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
        const devicesId = uuidv4();
        const deviceDetails: LoginDevice = {
            deviceId: devicesId,
            deviceName: req.useragent?.source || "Unknown",
            os: req.useragent?.os || "Unknown",
            lastLogin: new Date(),
        };

        // Create a new Map for loginDevices
        const loginDevices = new Map<string, LoginDevice>();
        loginDevices.set(devicesId, deviceDetails);

        // Create and save user
        const user = new UserModel({
            name,
            email,
            password,
            loginDevices,
        });
        const otp = user.generateOTP();
        const token = user.generateToken();
        await user.save();

        // Send OTP email asynchronously
        sendOtpEmail(email, otp).catch(console.error);

        // Respond with success
        res.status(201).json({
            message: "User created",
            token,
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

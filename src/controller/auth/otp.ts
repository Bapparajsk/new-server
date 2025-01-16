import { Request, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import sendOtpEmail from "../../lib/email";
import { verifyToken } from "../../lib/jwt"
import UserModel from "../../models/user.model";
import {LoginDevice, User} from "../../schema/user.schema";
import {sortUser} from "../../lib/user";

const otpMach = (user: User, otp: string): [boolean, string] => {
    // Check if OTP exists for the user
    if (!user.otp) {
        return [false ,"OTP not found"];
    }

    // Check if OTP is expired
    if (user.otpExpires && user.otpExpires < new Date()) {
        return [false, "OTP expired"];
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
        return [false, "Invalid OTP"];
    }

    return [true, "OTP verified"];
}

export const verifyOtp = async (req: Request, res: Response) => {
    const { otp } = req.body;

    // Check if OTP is provided
    if (!otp) {
        res.status(400).json({ message: "OTP is required" });
        return;
    }

    try {
        const user = req.User;

        // Check if user is authenticated
        if(!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const [verified, message] = otpMach(user, otp);
        if (!verified) {
            res.status(400).json({ message });
            return;
        }

        // Clear OTP and expiration date after successful verification
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        res.status(200).json({ message: "OTP verified" });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "interval server error" });
    }
}

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const user = req.User;

        // Check if user is authenticated
        if(!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Generate OTP
        const otp = user.generateOTP();
        await user.save();

        // Send OTP email asynchronously
        sendOtpEmail(user.email, otp).catch(console.error);

        res.status(200).json({ message: "OTP sent" });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "interval server error" });
    }
}

export const loginWithOtp = async (req: Request, res: Response) => {
    const { tempToken, otp } = req.body;

    // Check if OTP is provided
    if (!otp) {
        res.status(400).json({ message: "OTP is required" });
        return;
    }

    if (!tempToken) {
        res.status(400).json({ message: "Temporary token is required" });
        return;
    }

    try {
        const verifiedUser = verifyToken(tempToken) as {email : string};
        if (!verifiedUser || verifiedUser.email === undefined) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }

        const user = await UserModel.findOne({ email: verifiedUser.email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const [verified, message] = otpMach(user, otp);
        if (!verified) {
            res.status(400).json({ message });
            return;
        }

        // Clear OTP and expiration date after successful verification
        user.otp = null;
        user.otpExpires = null;

        // loginDevices add new device
        const devicesId = uuid4();
        const deviceDetails: LoginDevice = {
            deviceId: devicesId,
            deviceName: req.useragent?.source || "Unknown",
            os: req.useragent?.os || "Unknown",
            lastLogin: new Date(),
        };
        user.loginDevices.set(devicesId, deviceDetails);

        // create token
        const token = user.generateToken({devicesId}, "2d");

        // save user
        await user.save();

        res.status(200).json({ token, user: sortUser(user) })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "interval server error" });
    }
};

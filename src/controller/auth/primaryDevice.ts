import { Request, Response } from "express";
import {LoginDevice, User} from "../../schema/user.schema";
import { generateToken } from "../../lib/jwt";
import sendOtpEmail from "../../lib/email";

const isPrimaryExists = (list: Map<string, LoginDevice>): boolean => {
    const values = list.values();
    for (const value of values) {
        if (value.isPrimary) {
            return true;
        }
    }
    return false;
}

const isPrimaryDevice = (list: Map<string, LoginDevice>, deviceId: string): boolean => {
    const device = list.get(deviceId);
    if (device) {
        return device.isPrimary;
    }
    return false;
}

const setTask = (user: User, deviceId: string, task: "setPrimaryDevice" | "removePrimaryDevice"): [boolean, string, null | string] => {
    try {
        if(!user.loginDevices.has(deviceId)) {
            return [true, "Device Not Found", null];
        }

        const otp = user.generateOTP();
        const accessToken = generateToken({ task , deviceId }, "5m");

        sendOtpEmail(user.email, otp).catch(console.error);
        return [false, "OTP Sent", accessToken];
    } catch (e) {
        console.error(e);
        return [true, "Internal Server Error", null];
    }
}

const setPrimaryDevice = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized"});
            return;
        }

        const deviceId = req.params.deviceId;
        if (!deviceId) {
            res.status(400).json({message: "Bad Request"});
            return;
        }

        if (isPrimaryDevice(user.loginDevices, deviceId)) {
            res.status(400).json({message: "Device Already Primary"});
            return;
        }

        if (isPrimaryExists(user.loginDevices)) {
            res.status(400).json({message: "Primary Device Already Exists"});
            return;
        }

        const [error, message, accessToken] = setTask(user, deviceId, "setPrimaryDevice");
        if (error) {
            res.status(500).json({ message });
            return;
        }

        user.accessToken = accessToken;
        user.accessTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await user.save();
        res.status(200).json({message: "OTP Sent", accessToken});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

const removePrimaryDevice = async (req: Request, res: Response) => {
    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized"});
            return;
        }

        const deviceId = req.params.deviceId;
        if (!deviceId) {
            res.status(400).json({message: "Bad Request"});
            return;
        }

        if (!isPrimaryDevice(user.loginDevices, deviceId)) {
            res.status(400).json({message: "Device Not Primary"});
            return;
        }

        const [error, message, accessToken] = setTask(user, deviceId, "removePrimaryDevice");
        if (error) {
            res.status(500).json({ message });
            return;
        }

        await user.save();
        res.status(200).json({message: "OTP Sent", accessToken});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

export {
    setPrimaryDevice,
    removePrimaryDevice
};

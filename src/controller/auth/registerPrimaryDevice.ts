import { Request, Response } from "express";
import {LoginDevice} from "../../schema/user.schema";
import sendOtpEmail from "../../lib/email";

const isPrimaryExists = (list: Map<string, LoginDevice>): boolean => {
    const values = list.values();
    for (const value of values) {
        if (value.isPrimary) {
            return false;
        }
    }

    return true;
}

const registerPrimaryDevice = async (req: Request, res: Response) => {
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

        if (isPrimaryExists(user.loginDevices)) {
            res.status(400).json({message: "Primary Device Already Exists"});
            return;
        }

        if (!user.loginDevices.get(deviceId)) {
            res.status(400).json({message: "Device Not Found"});
            return;
        }

        const otp = user.generateOTP();
        const accessToken = user.generateToken({task: "registerPrimaryDevice" , deviceId});

        sendOtpEmail(user.email, otp).catch(console.error);
        res.status(200).json({message: "OTP Sent", accessToken});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

export default registerPrimaryDevice;

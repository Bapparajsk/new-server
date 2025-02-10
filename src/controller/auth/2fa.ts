import { Request, Response } from "express";
import {generateToken} from "../../lib/jwt";
import sendOtpEmail from "../../lib/email";

export const towFactorAuth = async (req: Request, res: Response) => {
    const user = req.User;
    if (!user) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    try {
        const { towFactorAuth } = req.body;
        if (towFactorAuth === undefined) {
            res.status(400).json({ message: "missing required fields" });
            return;
        }

        if (towFactorAuth && user.towFactorAuth) {
            res.status(400).json({ message: "2FA is already enabled" });
            return;
        }

        if (!towFactorAuth && !user.towFactorAuth) {
            res.status(400).json({ message: "2FA is already disabled" });
            return;
        }

        const accessToken = generateToken({ env: towFactorAuth ? "register2FA" : "unregister2FA" }, "5m");
        const otp = user.generateOTP();

        user.accessToken = accessToken;
        user.accessTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        res.status(200).json({ message: "OTP Sent in your Email", accessToken });
        sendOtpEmail(user.email, otp).catch(console.error);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "internal server error" });
    }
}

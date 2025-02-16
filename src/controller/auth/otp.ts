import {Request, Response} from 'express';
import {v4 as uuid4} from 'uuid';
import sendOtpEmail from "../../lib/email";
import {verifyToken} from "../../lib/jwt"
import UserModel from "../../models/user.model";
import {LoginDevice, Notification, User} from "../../schema/user.schema";
import {sortUser} from "../../lib/user";
import {setCookie} from "../../lib/setCookie";
import {userNotificationProducer} from "../../lib/bullmqProducer";

const otpMach = (user: User, otp: string | undefined): [boolean, string] => {
    if (!otp) {
        return [false, "OTP is required"];
    }

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

    // Clear OTP and expiration date after successful verification
    user.otp = null;
    user.otpExpires = null;
    return [true, "OTP verified"];
}

const verifyOtpAndAccessToken = (user: User, accessToken: string, otp: string): [boolean, string] => {
    if (user.accessTokenExpires && user.accessTokenExpires < new Date()) {
        return [true, "Token expired"];
    }

    if (user.accessToken !== accessToken) {
        return [true, "Invalid token"];
    }

    if (otp.length !== 6) {
        return [true, "Invalid OTP"];
    }

    if (user.otp !== otp) {
        return [true, "Invalid OTP"];
    }

    return [false, "OTP verified"];
}

export const verifyOtp = async (req: Request, res: Response) => {
    const { otp } = req.body;

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

        user.verifyEmail = true;
        user.notifications.push({
            name: "Email",
            title: "Email Verification",
            description: "Email verified",
            imageSrc: {
                env: "local",
                url: "/notification/email.png",
                alt: user.name,
            },
            type: "email",
            date: new Date()
        });

        // save user
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

        if (typeof tempToken !== "string") {
            res.status(400).json({ message: "Invalid token" });
            return;
        }

        if (user.accessTokenExpires && user.accessTokenExpires < new Date()) {
            res.status(400).json({ message: "Token expired" });
            return;
        }

        if (user.accessToken !== tempToken) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }

        const [verified, message] = otpMach(user, otp);
        if (!verified) {
            res.status(400).json({ message });
            return;
        }

        // loginDevices add new device
        const deviceId = uuid4();
        const deviceDetails: LoginDevice = {
            deviceId: deviceId,
            deviceName: req.useragent?.source || "Unknown",
            os: req.useragent?.os || "Unknown",
            lastLogin: new Date(),
            isPrimary: false
        };
        user.loginDevices.set(deviceId, deviceDetails);

        // create token
        const token = user.generateToken({deviceId}, "2d");

        user.accessToken = null;
        user.accessTokenExpires = null;
        // save user
        await user.save();
        setCookie(res, token);

        res.status(200).json({ user: sortUser(user) })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "interval server error" });
    }
};

export const primaryDeviceVerifyOtp = async (req: Request, res: Response) => {
    const { accessToken, otp } = req.body;
    if (!accessToken || !otp) {
        res.status(400).json({ message: "Temporary token and otp is required" });
        return;
    }

    const user = req.User;
    if (!user) {
        res.status(404).json({ message: "Unauthorized" });
        return;
    }

    try {
        const [isError, errorMessage] = verifyOtpAndAccessToken(user, accessToken, otp);
        if (isError) {
            res.status(400).json({ message: errorMessage });
            return;
        }

        const { task, deviceId } = verifyToken(accessToken) as {task: string, deviceId : string};
        if (!["setPrimaryDevice", "removePrimaryDevice"].includes(task) || !deviceId) {
            res.status(400).json({ message: "Invalid token" });
        }

        const device = user.loginDevices.get(deviceId);
        if (!device) {
            res.status(404).json({ message: "Device not found" });
            return;
        }

        const [verified, message] = otpMach(user, otp);
        if (!verified) {
            res.status(400).json({ message });
            return;
        }

        // set primary device or remove primary device
        device.isPrimary = task === "setPrimaryDevice";
        user.accessToken = null;
        user.accessTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "OTP verified" });

        const notification: Notification = {
            name: "Primary Device",
            title: "Primary Device",
            description: task === "setPrimaryDevice" ? "Primary device set" : "Primary device removed",
            imageSrc: {
                env: "local",
                url: "/notification/primaryDevice.png",
                alt: user.name,
            },
            type: "primaryDevice",
            date: new Date()
        }

        userNotificationProducer({ id: user._id as string, notification }).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "interval server error" });
    }
}

export const towFactorAuthOtpVerify = async (req: Request, res: Response) => {
    try {
        const {accessToken, otp} = req.body;
        if (!accessToken || !otp) {
            res.status(400).json({message: "Temporary token and otp is required"});
            return;
        }

        const user = req.User;
        if (!user) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        const [isError, errorMessage] = verifyOtpAndAccessToken(user, accessToken, otp);
        if (isError) {
            res.status(400).json({message: errorMessage});
            return;
        }

        const { env } = verifyToken(accessToken) as {env: string};

        if (env !== "register2FA" && env !== "unregister2FA") {
            res.status(400).json({message: "Invalid token"});
            return;
        }

        user.towFactorAuth = env === "register2FA";
        user.accessToken = null;
        user.accessTokenExpires = null;
        await user.save();

        const message = env === "register2FA" ? "2FA enabled" : "2FA disabled";
        res.status(200).json({message, towFactorAuth : env === "register2FA"});
        const notification: Notification = {
            name: "2FA",
            title: env === "register2FA" ? "Register 2FA" : "Unregister 2FA",
            description: message,
            imageSrc: {
                env: "local",
                url: "/notification/2FA.png",
                alt: user.name,
            },
            type: "2FA",
            date: new Date()
        }

        userNotificationProducer({ id: user._id as string, notification }).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "interval server error"});
    }
}

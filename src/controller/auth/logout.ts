import { Request, Response } from "express";
import {Notification} from "../../schema/user.schema";
import {userNotificationProducer} from "../../lib/bullmqProducer";

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: "Logged out" });
};

export const logoutDevice = async (req: Request, res: Response) => {
    const deviceId = req.params.deviceId;
    if (!deviceId) {
        res.status(400).json({ message: "DeviseId is required" });
        return;
    }

    try {
        const user = req.User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Check if the device exists
        const devise = user.loginDevices.get(deviceId);
        if (devise === undefined) {
            res.status(404).json({ message: "Devise not found" });
            return;
        }

        // Check if the device is primary
        if (devise.isPrimary) {
            res.status(400).json({ message: "Cannot logout primary devise" });
            return;
        }

        user.loginDevices.delete(deviceId);
        await user.save();
        res.status(200).json({ message: "Logged out" });

        // Send notification to the user
        const notification: Notification = {
            name: "Logout",
            title: "Logout",
            description: "Logout from " + devise.deviceName,
            imageSrc: {
                env: "local",
                url: "/notification/logout.png",
                alt: user.name,
            },
            type: "logout",
        }
        userNotificationProducer({ id: user._id as string, notification }).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const logoutDevices = async (req: Request, res: Response) => {
    try {
        const { deviceIds } = req.body as { deviceIds: string[] };
        const currentDeviceId = req.deviceId;
        const user = req.User;
        if (!user || !currentDeviceId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Logout all devices except the primary device
        const results = deviceIds.map(deviceId => {
            const devise = user.loginDevices.get(deviceId);
            if (devise === undefined) {
                return { error: true, message: "Device not found", deviceId };
            }
            if (devise.isPrimary) {
                return { error: true, message: "Cannot logout primary device", deviceId };
            }

            if (devise.deviceId === currentDeviceId) {
                res.clearCookie('authToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }

            user.loginDevices.delete(deviceId);
            return { error: false, message: "Logged out", deviceId };
        });

        // Save the user
        await user.save();
        res.status(200).json({ message: "Logged out", results });

        // Send notification to the user
        const notification: Notification = {
            name: "Logout",
            title: "Logout",
            description: "Logout from all devices",
            imageSrc: {
                env: "local",
                url: "/notification/logout.png",
                alt: user.name,
            },
            type: "logout",
        }
        userNotificationProducer({ id: user._id as string, notification }).catch(console.error);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

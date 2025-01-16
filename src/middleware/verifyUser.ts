import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/user.model";
import { verifyToken } from "../lib/jwt";

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token');
    // * const token = req.cookies.authToken;  // this for production

    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const id = verifyToken(token) as { _id: string, deviceId: string };
        if (!id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await UserModel.findById(id);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!user.loginDevices.has(id.deviceId)) {
            console.log('device not found');
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        req.User = user;
        req.deviceId = id.deviceId
        next();
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "interval server error" });
    }
}

export default verifyUser;

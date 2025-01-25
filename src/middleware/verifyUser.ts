import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/user.model";
import { verifyToken } from "../lib/jwt";



const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    //const token = req.header('x-auth-token');
    try {
        console.log(req.cookies)
        const token = req.cookies.authToken;  // this for production

        const method = req.method;

        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }


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

        if (method !== "GET") {
            if (user.verifyEmail === false) {
                res.status(403).json({ message: "Email is not verified. Please verify your email to access this resource." });
                return;
            }
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

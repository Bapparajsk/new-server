import { Request, Response } from "express";

const logout = async (req: Request, res: Response) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: "Logged out" });
};

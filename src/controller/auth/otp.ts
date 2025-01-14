import { Request, Response } from 'express';

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

        // Check if OTP exists for the user
        if (!user.otp) {
            res.status(400).json({ message: "OTP not found" });
            return;
        }

        // Check if OTP is expired
        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({ message: "OTP expired" });
            return;
        }

        // Check if OTP is valid
        if (user.otp !== otp) {
            res.status(400).json({ message: "Invalid OTP" });
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

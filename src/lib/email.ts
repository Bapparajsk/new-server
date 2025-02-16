import {transporter} from "../config";

const sendOtpEmail = async (email: string, otp: string) => {
    try {
        await transporter.sendMail({
            from: process.env.TRANSPORTER_USER || "your email",
            to: email,
            subject: "OTP",
            text: `Your OTP is ${otp}`,
        });
    } catch (error) {
        console.error(error);
    }
}

export const sendEmail = async (email: string, subject: string, text: string) => {
    try {
        await transporter.sendMail({
            from: process.env.TRANSPORTER_USER || "your email",
            to: email,
            subject,
            text,
        });
    } catch (error) {
        console.error(error);
    }
}

export default sendOtpEmail;

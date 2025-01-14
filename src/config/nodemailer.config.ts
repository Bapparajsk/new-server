import { createTransport } from 'nodemailer';

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.TRANSPORTER_USER || "your email",
        pass: process.env.TRANSPORTER_PASS || "your password",
    },
});

export default transporter;

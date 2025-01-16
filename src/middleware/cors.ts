import cors from "cors";

const corsMiddleware = cors({
    origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
});

export default corsMiddleware;

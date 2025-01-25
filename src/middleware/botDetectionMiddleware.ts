import { Request, Response, NextFunction } from "express";


// Middleware to check if the request is from a bot
const botDetectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // List of common bot user-agent keywords (You can expand this list)
    const botKeywords = ['bot', 'crawl', 'spider', 'slurp', 'google', 'yahoo', 'bing'];

    const userAgent = req.useragent?.source.toLowerCase();

    // Check if the user-agent contains bot-like keywords
    const isBot = botKeywords.some(keyword => userAgent?.includes(keyword));

    if (isBot) {
        res.status(403).json({ message: 'Access denied. Bots are not allowed.' });
        return;
    }

    next(); // Proceed if it's a real user
};

export default botDetectionMiddleware;

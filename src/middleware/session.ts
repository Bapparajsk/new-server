import session from "express-session";

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "your secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

export default sessionMiddleware;

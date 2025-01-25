import 'dotenv/config';
import './config/db.config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from "cookie-parser";
import useragent from 'express-useragent';
import { passport } from "./config";
import {
    rateLimiter,
    sessionMiddleware,
    helmetMiddleware,
    verifyUser,
    botDetectionMiddleware
} from "./middleware";

// * router
import {authRouter,userRouter, friendRouter} from "./router";

const app = express();
const {helmet, helmetContentSecurityPolicy} = helmetMiddleware;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.use(botDetectionMiddleware);
app.use(rateLimiter);
app.use(cors({
    origin: ['http://127.0.0.1:3000'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(helmet.contentSecurityPolicy(helmetContentSecurityPolicy));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

app.use('/api/auth', authRouter);                   // * user auth routes and passport routes
app.use('/api/user', verifyUser , userRouter);      // * user routes for user profile and user settings
app.use('/api/friend', verifyUser , friendRouter);  // * friend routes for friend list and friend request

// ! test route
app.get("/", verifyUser , (req, res) => {
    res.json({ user: req.User || "it is work" });
})

export default app;

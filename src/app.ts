import 'dotenv/config';
import './config/db.config';
import "./lib/bullmqWorker";
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
import {authRoute,userRoute, friendRoute, postRoute, notificationRoute} from "./router";
import { pushNotificationFireBaseAndSocketProducer } from './lib/bullmqProducer';

const app = express();
const {helmet, helmetContentSecurityPolicy} = helmetMiddleware;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.use(botDetectionMiddleware);
app.use(rateLimiter);
app.use(cors({
    origin: 'http://127.0.0.1:3000',
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

app.use('/api/auth', authRoute);                   // * user auth routes and passport routes
app.use('/api/user', verifyUser , userRoute);      // * user routes for user profile and user settings
app.use('/api/friend', verifyUser , friendRoute);  // * friend routes for friend list and friend request
app.use('/api/post', verifyUser , postRoute);  // * friend routes for friend list and friend request
app.use('/api/notification', verifyUser , notificationRoute);  // * friend routes for friend list and friend request

// ! test route
app.get("/:uid", async (req, res) => {
    const userId = req.params.uid;
    console.log(userId);
    
    await pushNotificationFireBaseAndSocketProducer({
        id: userId,
        notification: {
            name: "test",
            title: "test",
            description: "test",
            date: new Date(),
            type: "name"
        }
    })

    res.send('okay');
})

export default app;

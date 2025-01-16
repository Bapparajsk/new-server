import 'dotenv/config';
import './config/db.config';
import express from 'express';
import morgan from 'morgan';
import useragent from 'express-useragent';
import { passport } from "./config";
import {rateLimiter, corsMiddleware, sessionMiddleware, helmetMiddleware, verifyUser} from "./middleware";

// * router
import {authRouter} from "./router";

const app = express();
const PORT: number = Number(process.env.PORT || "8000");

const {helmet, helmetContentSecurityPolicy} = helmetMiddleware;

app.use(morgan('dev'));
app.use(express.json());
app.use(useragent.express());
app.use(rateLimiter);
app.use(corsMiddleware);
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

app.use('/api/auth', authRouter);

// ! test route
app.get("/", verifyUser, (req, res) => {
    res.json({ user: req.User });
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});

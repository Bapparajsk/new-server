import 'dotenv/config';
import './config/db.config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from "express-session";
import useragent from 'express-useragent';
import { passport } from "./config"

// router
import {authRouter} from "./router";
import verifyUser from "./middleware/verifyUser";

const app = express();
const PORT: number = Number(process.env.PORT) || 8000;

app.use(morgan('dev'));
app.use(express.json());
app.use(useragent.express());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(session({
    secret: process.env.SESSION_SECRET || "your secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);

app.get("/", verifyUser, (req, res) => {
    res.json({ user: req.User });
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});

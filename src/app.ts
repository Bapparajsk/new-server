import 'dotenv/config';
import './config/db.config';
import express from 'express';
import morgan from 'morgan';
import useragent from 'express-useragent';
import { passport } from "./config";
import { rateLimiter, corsMiddleware, sessionMiddleware } from "./middleware";

// * router
import {authRouter} from "./router";

const app = express();
const PORT: number = Number(process.env.PORT || "8000");

app.use(morgan('dev'));
app.use(express.json());
app.use(useragent.express());
app.use(rateLimiter);
app.use(corsMiddleware);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
    res.json({ user: req.User });
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});

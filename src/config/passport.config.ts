import {NextFunction, Request, Response} from "express";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy} from 'passport-github2';
import {googleStrategyVerify, StrategyVerify} from '../middleware/passport-oauth';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "your google client id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your google client secret",
    callbackURL: 'http://127.0.0.1:8000/api/auth/google/callback',
    scope: ['id', 'displayName', 'photos', 'email'],
}, googleStrategyVerify ));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "your github client id",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "your github client secret",
    callbackURL: 'http://127.0.0.1:8000/api/auth/github/callback',
    scope: ['user:email', 'id', 'displayName', 'photos'],
}, StrategyVerify ));


passport.serializeUser((user: any, done: any) => {
    done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
    done(null, user);
});

const authenticateAndRedirect = (strategy: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(strategy, (err: any, user: Express.User, info: any) => {
            if (err || !user) {
                return res.redirect("http://localhost:3000/register");
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.redirect("http://localhost:3000/register");
                }
                // todo create a token and send it to the user
                return res.redirect("http://localhost:3000");
            });
        })(req, res, next);
    };
};

export { passport, authenticateAndRedirect };

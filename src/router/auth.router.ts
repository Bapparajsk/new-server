import { Router } from "express";
import { login, register, verifyOtp, loginWithOtp, sendOtp } from "../controller/auth";
import verifyUser from "../middleware/verifyUser";
import {passport, authenticateAndRedirect} from '../config';

const authRouter = Router();

// * Path: /api/auth
authRouter.post('/login', login);  // Path: /api/auth/login
authRouter.post('/register', register);  // Path: /api/auth/register

// * Path: /api/auth/otp
authRouter.post('/otp/login-with', loginWithOtp);  // Path: /api/auth/otp
authRouter.post('/otp/verify', verifyUser, verifyOtp);  // Path: /api/auth/otp/verify

// * passport authentication routes google and github
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', authenticateAndRedirect('google'));

authRouter.get('/github', passport.authenticate('github', { scope: ['user:email', 'id', 'displayName', 'photos'] }));
authRouter.get('/github/callback', authenticateAndRedirect('github'));

export default authRouter;

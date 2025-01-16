import { Router } from "express";
import {
    login, register,
    verifyOtp, loginWithOtp, sendOtp,
    logout, logoutDevice, logoutDevices,
    registerPrimaryDevice, registerPrimaryDeviceVerifyOtp
} from "../controller/auth";
import verifyUser from "../middleware/verifyUser";
import {passport, authenticateAndRedirect} from '../config';

const authRouter = Router();

// * Path: /api/auth
authRouter.post('/login', login);  // Path: /api/auth/login
authRouter.post('/register', register);  // Path: /api/auth/register

// * Path: /api/auth/otp
authRouter.post('/otp/login-with', loginWithOtp);  // Path: /api/auth/otp
authRouter.post('/otp/verify', verifyUser, verifyOtp);  // Path: /api/auth/otp/verify
authRouter.post('/otp/send', verifyUser, sendOtp);  // Path: /api/auth/otp/send

// * Path: /api/auth/logout
authRouter.delete("/logout", verifyUser, logout);  // Path: /api/auth/logout
authRouter.delete("/logout/:deviceId", verifyUser, logoutDevice);  // Path: /api/auth/logout/:deviceId
authRouter.post("/logout/devices", verifyUser, logoutDevices);  // Path: /api/auth/logout/devices

// * passport authentication routes google and github
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', authenticateAndRedirect('google'));

authRouter.get('/github', passport.authenticate('github', { scope: ['user:email', 'id', 'displayName', 'photos'] }));
authRouter.get('/github/callback', authenticateAndRedirect('github'));

authRouter.patch("/register-primary-device/:deviceId", verifyUser, registerPrimaryDevice);  // Path: /api/auth/register-primary-device/:deviceId
authRouter.post("/register-primary-device/verify-otp", verifyUser, registerPrimaryDeviceVerifyOtp);  // Path: /api/auth/register-primary-device/verify-otp

export default authRouter;

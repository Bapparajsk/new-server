import { Router } from "express";
import {
    login, register,
    verifyOtp, loginWithOtp, sendOtp,
    logout, logoutDevice, logoutDevices,
    setPrimaryDevice, removePrimaryDevice, primaryDeviceVerifyOtp
} from "../controller/auth";
import verifyUser from "../middleware/verifyUser";
import {passport, authenticateAndRedirect} from '../config';

const authRoute = Router();

// * Path: /api/auth
authRoute.post('/login', login);  // Path: /api/auth/login
authRoute.post('/register', register);  // Path: /api/auth/register

// * Path: /api/auth/otp
authRoute.post('/otp/login-with', loginWithOtp);  // Path: /api/auth/otp
authRoute.post('/otp/verify', verifyUser, verifyOtp);  // Path: /api/auth/otp/verify
authRoute.post('/otp/send', verifyUser, sendOtp);  // Path: /api/auth/otp/send

// * Path: /api/auth/logout
authRoute.delete("/logout", verifyUser, logout);  // Path: /api/auth/logout
authRoute.delete("/logout/:deviceId", verifyUser, logoutDevice);  // Path: /api/auth/logout/:deviceId
authRoute.post("/logout/devices", verifyUser, logoutDevices);  // Path: /api/auth/logout/devices

// * passport authentication routes google and gitHub
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRoute.get('/google/callback', authenticateAndRedirect('google'));

authRoute.get('/github', passport.authenticate('github', { scope: ['user:email', 'id', 'displayName', 'photos'] }));
authRoute.get('/github/callback', authenticateAndRedirect('github'));

authRoute.put("/register-primary-device/verify-otp", verifyUser, primaryDeviceVerifyOtp);  // Path: /api/auth/register-primary-device/verify-otp
authRoute.post("/register-primary-device/:deviceId", verifyUser, setPrimaryDevice);  // Path: /api/auth/register-primary-device/:deviceId
authRoute.delete("/remove-primary-device/:deviceId", verifyUser, removePrimaryDevice);  // Path: /api/auth/remove-primary-device/:deviceId

export default authRoute;
